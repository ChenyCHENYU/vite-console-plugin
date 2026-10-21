import type { Plugin, ViteDevServer } from "vite";
import { readFileSync } from "fs";
import path from "path";
import { createMessageFilter, type BlockPattern } from "./filter";
import { collectGitInfo, GIT_UNAVAILABLE, type GitInfo } from "./git";
import { renderBanner } from "./banner";
import { colors } from "./colors";

export interface PluginOptions {
  /** 系统名称；留空时自动读取项目 package.json 的 name */
  systemName?: string;
  /** 系统描述，显示在标题旁；留空隐藏 */
  description?: string;
  /** 团队名称；留空隐藏 */
  team?: string;
  /** 项目负责人；留空隐藏 */
  owner?: string;
  /** 协作提醒（黄色）；留空隐藏 */
  warning?: string;
  /** 安全提醒（红色）；留空隐藏 */
  security?: string;
  /** 是否自动读取 package.json 版本号，默认 true */
  autoVersion?: boolean;
  /** 开发工具提示（如 DevTools 地址）；留空隐藏 */
  devtools?: string;
  /** 追加的自定义屏蔽规则（字符串按正则源码、RegExp 保留 flags） */
  blockPatterns?: BlockPattern[];
}

export const defaultPluginOptions: Required<PluginOptions> = {
  systemName: "",
  description: "",
  team: "",
  owner: "",
  warning: "",
  security: "",
  autoVersion: true,
  devtools: "",
  blockPatterns: [],
};

type LogFn = (msg: string, opts?: { clear?: boolean; timestamp?: boolean }) => void;

const RESTART_RE = /server\s+restarted/i;

// 模块级状态：模块在进程内只加载一次，天然防止多实例重复输出
let welcomePrinted = false;
let gitInfoPromise: Promise<GitInfo> | null = null;

// 已包装过的 logger 实例（dev server 重启复用 logger 时防止二次包装）
const wrappedLoggers = new WeakSet<object>();

function readProjectInfo(root: string): { name: string; version: string } {
  try {
    const pkg: { name?: string; version?: string } = JSON.parse(
      readFileSync(path.resolve(root, "package.json"), "utf-8")
    );
    return { name: pkg.name || "Vite App", version: pkg.version || "0.0.0" };
  } catch {
    return { name: "Vite App", version: "0.0.0" };
  }
}

// —— 启动窗口期临时接管 console：窗口结束后完全还原，稳态零开销 ——
// Vite 自身输出走 logger，但部分插件直接 console.log 打印提示，这里兜底拦截。
type ConsoleFn = (...args: unknown[]) => void;

const consoleGuard: {
  armed: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  log: ConsoleFn | null;
  info: ConsoleFn | null;
  warn: ConsoleFn | null;
  wrappedLog: ConsoleFn | null;
  wrappedInfo: ConsoleFn | null;
  wrappedWarn: ConsoleFn | null;
} = {
  armed: false,
  timer: null,
  log: null,
  info: null,
  warn: null,
  wrappedLog: null,
  wrappedInfo: null,
  wrappedWarn: null,
};

function armConsoleGuard(shouldBlock: (msg: string) => boolean, lifetimeMs: number): void {
  if (!consoleGuard.armed) {
    consoleGuard.armed = true;
    const wrap =
      (original: ConsoleFn): ConsoleFn =>
      (...args: unknown[]) => {
        // 屏蔽规则均以整行提示为主，只检查首参即可命中，避免无谓的字符串拼接
        const first = args[0];
        if (typeof first === "string" && shouldBlock(first)) return;
        original(...args);
      };

    consoleGuard.log = console.log as ConsoleFn;
    consoleGuard.info = console.info as ConsoleFn;
    consoleGuard.warn = console.warn as ConsoleFn;
    consoleGuard.wrappedLog = wrap(consoleGuard.log.bind(console));
    consoleGuard.wrappedInfo = wrap(consoleGuard.info.bind(console));
    consoleGuard.wrappedWarn = wrap(consoleGuard.warn.bind(console));
    console.log = consoleGuard.wrappedLog as typeof console.log;
    console.info = consoleGuard.wrappedInfo as typeof console.info;
    console.warn = consoleGuard.wrappedWarn as typeof console.warn;
  }
  if (consoleGuard.timer) clearTimeout(consoleGuard.timer);
  consoleGuard.timer = setTimeout(disarmConsoleGuard, lifetimeMs);
  consoleGuard.timer.unref?.();
}

function disarmConsoleGuard(): void {
  if (!consoleGuard.armed) return;
  consoleGuard.armed = false;
  if (consoleGuard.timer) {
    clearTimeout(consoleGuard.timer);
    consoleGuard.timer = null;
  }
  // 仅当安装的仍是自己的包装时还原，避免拆掉使用方在其上再包的层
  const installed = (current: unknown, wrapped: ConsoleFn | null) =>
    wrapped !== null && current === (wrapped as unknown);
  if (installed(console.log, consoleGuard.wrappedLog))
    console.log = consoleGuard.log as typeof console.log;
  if (installed(console.info, consoleGuard.wrappedInfo))
    console.info = consoleGuard.info as typeof console.info;
  if (installed(console.warn, consoleGuard.wrappedWarn))
    console.warn = consoleGuard.warn as typeof console.warn;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function printBanner(
  server: ViteDevServer,
  config: Required<PluginOptions>,
  git: Promise<GitInfo>
): Promise<void> {
  welcomePrinted = true;

  const project = readProjectInfo(server.config.root);
  const gitInfo = await Promise.race([git, wait(300).then(() => GIT_UNAVAILABLE)]);

  // resolvedUrls 在 listening 后可能仍有极短延迟，稍等兜底
  if (!server.resolvedUrls) await wait(150);

  const banner = renderBanner({
    systemName: config.systemName || project.name,
    description: config.description,
    localUrl:
      server.resolvedUrls?.local?.[0] ??
      `http://localhost:${server.config.server.port || 5173}/`,
    networkUrl: server.resolvedUrls?.network?.[0] ?? null,
    devtools: config.devtools,
    version: config.autoVersion ? project.version : null,
    git: gitInfo,
    startTime: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    team: config.team,
    owner: config.owner,
    warning: config.warning,
    security: config.security,
  });

  process.stdout.write(`\n${banner}\n\n`);

  // banner 之后的短暂窗口仍可能有插件补打印提示，随后彻底还原 console
  if (consoleGuard.armed && consoleGuard.timer) {
    clearTimeout(consoleGuard.timer);
    consoleGuard.timer = setTimeout(disarmConsoleGuard, 1200);
    consoleGuard.timer.unref?.();
  }
}

function printReloadHint(): void {
  process.stdout.write(
    `${colors.yellow}${colors.dim}⚡ vite 配置已重载，请确认修改项${colors.reset}\n`
  );
}

export default function viteConsolePlugin(options: PluginOptions = {}): Plugin {
  const config: Required<PluginOptions> = { ...defaultPluginOptions, ...options };
  const shouldBlock = createMessageFilter(config.blockPatterns);

  return {
    name: "vite-console-plugin",
    apply: "serve",

    config() {
      // 返回合并对象而不是修改用户配置
      return { clearScreen: false };
    },

    configResolved(resolved) {
      // git 信息在最早的时机异步预取（以 vite root 为工作目录），banner 打印时通常已就绪
      gitInfoPromise ??= collectGitInfo(resolved.root);
      // 启动窗口期接管 console 兜底；超时自动还原，稳态零开销
      armConsoleGuard(shouldBlock, 8000);
    },

    configureServer(server) {
      const logger = server.config.logger as unknown as {
        info: LogFn;
        warn: LogFn;
      };
      if (!wrappedLoggers.has(server.config.logger)) {
        wrappedLoggers.add(server.config.logger);
        const originalInfo = logger.info.bind(server.config.logger);
        const originalWarn = logger.warn.bind(server.config.logger);

        logger.info = (msg, opts) => {
          if (typeof msg === "string" && shouldBlock(msg)) return;
          originalInfo(msg, opts);
          if (typeof msg === "string" && RESTART_RE.test(msg)) printReloadHint();
        };
        logger.warn = (msg, opts) => {
          if (typeof msg === "string" && shouldBlock(msg)) return;
          originalWarn(msg, opts);
        };
      }

      if (welcomePrinted) return;
      server.httpServer?.once("listening", () => {
        void printBanner(
          server,
          config,
          gitInfoPromise ?? collectGitInfo(server.config.root)
        );
      });
    },
  };
}
