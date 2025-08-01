import type { Plugin } from "vite";
import { readFileSync } from "fs";
import { execSync } from "child_process";

declare global {
  // 避免多实例重复输出
  var __vite_console_plugin_state__: { hasShownWelcome: boolean } | undefined;
}

export interface PluginOptions {
  systemName?: string;
  description?: string;
  team?: string;
  owner?: string;
  warning?: string;
  security?: string;
  autoVersion?: boolean;
}

export const defaultPluginOptions: Required<PluginOptions> = {
  systemName: "Robot_Admin",
  description: "后台管理系统",
  team: "AGILE|TEAM",
  owner: "CHENY",
  warning: "请勿随意修改配置文件",
  security: "禁止部署未加密的敏感数据",
  autoVersion: true,
};

// 获取版本信息
const getVersionInfo = () => {
  try {
    const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
    return packageJson.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
};

// 获取 Git 信息
const getGitInfo = () => {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    const commit = execSync("git rev-parse --short HEAD").toString().trim();
    return { branch, commit };
  } catch {
    return { branch: "unknown", commit: "unknown" };
  }
};

// 颜色定义
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// 图标定义
const icons = {
  rocket: "🚀",
  package: "📦",
  team: "👥",
  user: "👨‍💻",
  branch: "🌿",
  commit: "🔗",
  warning: "⚠️",
  shield: "🛡️",
  time: "🕐",
  local: "🌐",
  network: "📡",
  devtools: "🔧",
  inspector: "🔍",
};

// 判断是否应该屏蔽消息
function shouldBlockMessage(msg: string): boolean {
  return (
    msg.includes("➜  Local:") ||
    msg.includes("➜  Network:") ||
    msg.includes("➜  Vue DevTools:") ||
    msg.includes("➜  UnoCSS Inspector:") ||
    msg.includes("➜  press h + enter")
  );
}

export default function viteConsolePlugin(options: PluginOptions = {}): Plugin {
  const config = { ...defaultPluginOptions, ...options };

  return {
    name: "vite-console-plugin",
    apply: "serve",
    config(userConfig) {
      // 不要设置 logLevel 为 silent，这会屏蔽所有信息
      // userConfig.logLevel = 'silent'
      // 禁用清屏功能
      userConfig.clearScreen = false;
    },
    configureServer(server) {
      const state = (globalThis.__vite_console_plugin_state__ ||= {
        hasShownWelcome: false,
      });

      // 重写 logger 的 info 方法来屏蔽特定信息
      const originalLoggerInfo = server.config.logger.info.bind(
        server.config.logger
      );
      const originalLoggerWarn = server.config.logger.warn.bind(
        server.config.logger
      );

      server.config.logger.info = (msg: string, opts?: any) => {
        // 屏蔽特定的启动信息
        if (
          msg.includes("Local:") ||
          msg.includes("Network:") ||
          msg.includes("Vue DevTools:") ||
          msg.includes("UnoCSS Inspector:") ||
          msg.includes("press h + enter") ||
          msg.includes("use --host to expose") ||
          msg.includes("Press Alt") ||
          msg.includes("Open http://") ||
          msg.includes("__devtools__") ||
          msg.includes("__unocss") ||
          msg.includes("as a separate window") ||
          msg.includes("to toggle the Vue DevTools")
        ) {
          return;
        }

        // 保留所有其他信息
        originalLoggerInfo(msg, opts);

        if (msg.includes("server restarted")) {
          console.log("");
          console.log(
            `${colors.yellow}${colors.dim}⚡ 配置重载${colors.reset} ${colors.red}${colors.dim}配置文件已更改，请验证修改项并告知相关干系人${colors.reset}`
          );
          console.log("");
        }
      };

      server.config.logger.warn = (msg: string, opts?: any) => {
        if (shouldBlockMessage(msg)) {
          return;
        }
        originalLoggerWarn(msg, opts);
      };

      // 同时拦截 console 输出（因为某些信息可能通过 console 输出）
      const originalConsoleInfo = console.info;
      const originalConsoleLog = console.log;

      console.info = (...args) => {
        const msg = args.join(" ");
        if (shouldBlockMessage(msg)) return;
        originalConsoleInfo(...args);
      };

      console.log = (...args) => {
        const msg = args.join(" ");
        if (shouldBlockMessage(msg)) return;
        originalConsoleLog(...args);
      };

      if (!state.hasShownWelcome) {
        server.httpServer?.once("listening", () => {
          setTimeout(() => {
            const version = config.autoVersion
              ? getVersionInfo()
              : config.systemName;
            const gitInfo = getGitInfo();
            const currentTime = new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            // 获取服务器地址信息
            const port = server.config.server.port || 3000;
            const host = server.config.server.host || "localhost";
            const localUrl = `http://${host}:${port}/`;
            const networkUrl =
              server.resolvedUrls?.network?.[0] || "需要 --host 参数启用";

            console.log("");
            console.log(`${colors.gray}${"─".repeat(50)}${colors.reset}`);

            // 系统标题
            console.log(
              `${colors.cyan}${colors.bright}🚀 ${config.systemName}${colors.reset} ${colors.gray}${config.description}${colors.reset}`
            );
            console.log("");

            // 服务器信息
            console.log(
              `${colors.white}${colors.bright}⚡ 服务器信息${colors.reset}`
            );
            console.log(
              `   ${colors.green}●${colors.reset} ${colors.white}本地访问${colors.reset}   ${colors.green}${colors.bright}${localUrl}${colors.reset}`
            );

            if (!networkUrl.includes("需要")) {
              console.log(
                `   ${colors.blue}●${colors.reset} ${colors.white}网络访问${colors.reset}   ${colors.blue}${networkUrl}${colors.reset}`
              );
            } else {
              console.log(
                `   ${colors.gray}●${colors.reset} ${colors.white}网络访问${colors.reset}   ${colors.gray}${networkUrl}${colors.reset}`
              );
            }

            console.log(
              `   ${colors.magenta}●${colors.reset} ${colors.white}开发工具${colors.reset}   ${colors.magenta}Vue DevTools & UnoCSS Inspector${colors.reset}`
            );
            console.log("");

            // 项目信息
            console.log(
              `${colors.white}${colors.bright}📦 项目信息${colors.reset}`
            );

            if (config.autoVersion) {
              console.log(
                `   ${colors.green}●${colors.reset} ${colors.white}版本号${colors.reset}       ${colors.green}${colors.bright}v${version}${colors.reset}`
              );
            }

            console.log(
              `   ${colors.blue}●${colors.reset} ${colors.white}启动时间${colors.reset}     ${colors.blue}${currentTime}${colors.reset}`
            );
            console.log(
              `   ${colors.magenta}●${colors.reset} ${colors.white}Git 分支${colors.reset}     ${colors.magenta}${gitInfo.branch}${colors.reset}`
            );
            console.log(
              `   ${colors.yellow}●${colors.reset} ${colors.white}提交哈希${colors.reset}     ${colors.yellow}${gitInfo.commit}${colors.reset}`
            );

            // 团队信息
            if (config.team || config.owner) {
              console.log("");
              console.log(
                `${colors.white}${colors.bright}👥 团队信息${colors.reset}`
              );

              if (config.team) {
                console.log(
                  `   ${colors.blue}●${colors.reset} ${colors.white}架构组${colors.reset}       ${colors.blue}${config.team}${colors.reset}`
                );
              }

              if (config.owner) {
                console.log(
                  `   ${colors.blue}●${colors.reset} ${colors.white}负责人${colors.reset}       ${colors.blue}${config.owner}${colors.reset}`
                );
              }
            }

            // 重要提醒
            if (config.warning || config.security) {
              console.log("");
              console.log(
                `${colors.white}${colors.bright}⚠️  重要提醒${colors.reset}`
              );

              if (config.warning) {
                console.log(
                  `   ${colors.yellow}●${colors.reset} ${colors.yellow}${config.warning}${colors.reset}`
                );
              }

              if (config.security) {
                console.log(
                  `   ${colors.red}●${colors.reset} ${colors.red}${config.security}${colors.reset}`
                );
              }
            }

            console.log("");
            console.log(
              `${colors.green}${colors.bright}✨ 启动成功！${colors.reset} ${colors.gray}开发服务器已就绪${colors.reset}`
            );
            console.log(`${colors.gray}${"─".repeat(50)}${colors.reset}`);
            console.log("");

            state.hasShownWelcome = true;
          }, 350);
        });
      }

      // 监听服务器重启不需要单独处理，已经在上面的 info 方法中处理
    },
  };
}
