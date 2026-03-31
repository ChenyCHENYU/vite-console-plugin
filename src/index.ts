import type { Plugin } from "vite";
import { readFileSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";

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
  devtools?: string;
}

export const defaultPluginOptions: Required<PluginOptions> = {
  systemName: "Robot_Admin",
  description: "后台管理系统",
  team: "AGILE|TEAM",
  owner: "CHENY",
  warning: "请勿随意修改配置文件",
  security: "禁止部署未加密的敏感数据",
  autoVersion: true,
  devtools: "",
};

// 获取版本信息
const getVersionInfo = (root: string) => {
  try {
    const packageJson = JSON.parse(
      readFileSync(path.resolve(root, "package.json"), "utf-8")
    );
    return packageJson.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
};

// 获取 Git 信息（增强版）
const getGitInfo = () => {
  try {
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .toString()
      .trim();
    const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"]).toString().trim();
    
    // 获取Git状态信息
    const gitStatus = getGitStatus(branch);
    
    return { 
      branch, 
      commit,
      branchStatus: gitStatus
    };
  } catch {
    return { 
      branch: "unknown", 
      commit: "unknown",
      branchStatus: "unknown (离线状态 📱)"
    };
  }
};

// 获取Git状态（新增函数）
const getGitStatus = (currentBranch: string): string => {
  try {
    // 检查是否有远程仓库
    execFileSync("git", ["remote"], { stdio: 'pipe' });
    
    let statusParts: string[] = [];
    
    // 1. 检查与对应远程分支的关系
    const remoteBranch = `origin/${currentBranch}`;
    try {
      // 检查远程分支是否存在
      execFileSync("git", ["show-ref", "--verify", "--quiet", `refs/remotes/${remoteBranch}`], { stdio: 'pipe' });
      
      // 获取本地相对于远程分支的状态
      const behindCount = Number(execFileSync("git", ["rev-list", "--count", `HEAD..${remoteBranch}`], { stdio: 'pipe' })
        .toString().trim());
      const aheadCount = Number(execFileSync("git", ["rev-list", "--count", `${remoteBranch}..HEAD`], { stdio: 'pipe' })
        .toString().trim());
      
      if (behindCount === 0 && aheadCount === 0) {
        statusParts.push('与远程同步 ✅');
      } else if (behindCount > 0 && aheadCount === 0) {
        statusParts.push(`落后远程 ${behindCount} 个提交 🔄`);
      } else if (behindCount === 0 && aheadCount > 0) {
        statusParts.push(`领先远程 ${aheadCount} 个提交 ⬆️`);
      } else {
        statusParts.push(`分叉状态 🔀`);
      }
    } catch {
      // 远程分支不存在
      statusParts.push('本地分支 📱');
    }
    
    // 2. 如果不是main分支，检查与main的关系
    if (currentBranch !== 'main' && currentBranch !== 'master') {
      try {
        // 检查origin/main是否存在
        let mainBranch = 'origin/main';
        try {
          execFileSync("git", ["show-ref", "--verify", "--quiet", "refs/remotes/origin/main"], { stdio: 'pipe' });
        } catch {
          try {
            execFileSync("git", ["show-ref", "--verify", "--quiet", "refs/remotes/origin/master"], { stdio: 'pipe' });
            mainBranch = 'origin/master';
          } catch {
            throw new Error('No main branch found');
          }
        }
        
        // 找到与main的共同祖先
        const mergeBase = execFileSync("git", ["merge-base", "HEAD", mainBranch], { stdio: 'pipe' })
          .toString().trim();
        const aheadOfMain = Number(execFileSync("git", ["rev-list", "--count", `${mergeBase}..HEAD`], { stdio: 'pipe' })
          .toString().trim());
        const behindMain = Number(execFileSync("git", ["rev-list", "--count", `HEAD..${mainBranch}`], { stdio: 'pipe' })
          .toString().trim());
        
        if (aheadOfMain === 0 && behindMain === 0) {
          statusParts.push('基于 main 最新代码 ✅');
        } else if (aheadOfMain > 0) {
          statusParts.push(`领先 main ${aheadOfMain} 个提交 ⬆️`);
        }
        
        if (behindMain > 0) {
          statusParts[statusParts.length - 1] = statusParts[statusParts.length - 1].replace(' ⬆️', '') + ` (main 领先 ${behindMain} 个提交) 🔄`;
        }
        
      } catch {
        // 无法获取main分支信息
      }
    }
    
    return `${currentBranch} (${statusParts.join(' | ')})`;
    
  } catch {
    return `${currentBranch} (离线状态 📱)`;
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

// 精确判断是否应该屏蔽消息
function shouldBlockMessage(msg: string): boolean {
  // 清理消息：去除 ANSI 颜色代码和多余空格
  const cleanMsg = msg.replace(/\x1b\[[0-9;]*m/g, '').trim();
  
  // 需要屏蔽的具体信息模式
  const blockPatterns = [
    /^➜\s+Local:\s+http:\/\/.*$/,                   // Local 地址
    /^➜\s+Network:\s+use\s+--host\s+to\s+expose.*$/, // Network 提示  
    /^➜\s+press\s+h\s+\+\s+enter\s+to\s+show\s+help.*$/, // 帮助提示
    /^➜\s+Vue DevTools:/,                           // Vue DevTools 相关
    /^➜\s+UnoCSS Inspector:/,                       // UnoCSS Inspector
    /Local:\s+http:\/\/.*$/,                        // 不带 ➜ 的 Local
    /Network:\s+use\s+--host\s+to\s+expose/,        // 不带 ➜ 的 Network
    /press\s+h\s+\+\s+enter\s+to\s+show\s+help/,   // 不带 ➜ 的帮助
    /use\s+--host\s+to\s+expose/,                   // host 参数提示
    /Press\s+Alt\s+\+\s+Shift\s+\+\s+D/,           // Vue DevTools 快捷键
    /Open\s+http:\/\/[^\/]+\/__devtools__\//,       // DevTools 窗口提示
    /as\s+a\s+separate\s+window/,                   // 窗口提示
    /to\s+toggle\s+the\s+Vue\s+DevTools/,          // DevTools 切换提示
    /__devtools__/,                                 // DevTools 路径
    /__unocss/,                                     // UnoCSS 路径
  ];

  // 检查是否匹配任何屏蔽模式
  return blockPatterns.some(pattern => pattern.test(cleanMsg));
}

// 判断是否为重要的构建/开发信息（需要保留的）
function isImportantDevMessage(msg: string): boolean {
  const importantPatterns = [
    /ready\s+in\s+\d+ms/i,                     // 构建完成时间
    /built\s+in\s+\d+ms/i,                     // 构建耗时
    /server\s+restarted/i,                     // 服务器重启
    /hmr\s+update/i,                           // HMR 更新
    /page\s+reload/i,                          // 页面重载
    /\d+\s+modules?\s+transformed/i,           // 模块转换
    /vite\s+v\d+\.\d+\.\d+/i,                // Vite 版本信息
    /dev\s+server\s+running/i,                // 开发服务器状态
    /optimizing\s+dependencies/i,              // 依赖优化
    /dependencies\s+optimized/i,               // 依赖优化完成
  ];

  return importantPatterns.some(pattern => pattern.test(msg));
}

export default function viteConsolePlugin(options: PluginOptions = {}): Plugin {
  const config = { ...defaultPluginOptions, ...options };

  return {
    name: "vite-console-plugin",
    apply: "serve",
    config(userConfig) {
      // 不设置 logLevel 为 silent，保留错误和警告
      // 禁用清屏功能
      userConfig.clearScreen = false;
    },
    configureServer(server) {
      const state = (globalThis.__vite_console_plugin_state__ ||= {
        hasShownWelcome: false,
      });

      // 重写 logger 的 info 方法
      const originalLoggerInfo = server.config.logger.info.bind(
        server.config.logger
      );
      const originalLoggerWarn = server.config.logger.warn.bind(
        server.config.logger
      );
      const originalLoggerError = server.config.logger.error.bind(
        server.config.logger
      );

      server.config.logger.info = (msg: string, opts?: any) => {
        // 如果是重要的开发信息，直接显示
        if (isImportantDevMessage(msg)) {
          originalLoggerInfo(msg, opts);
          return;
        }

        // 屏蔽特定的启动信息
        if (shouldBlockMessage(msg)) {
          return;
        }

        // 显示其他信息
        originalLoggerInfo(msg, opts);

        // 服务器重启后的自定义提示
        if (msg.includes("server restarted")) {
          console.log("");
          console.log(
            `${colors.yellow}${colors.dim}⚡ 配置重载${colors.reset} ${colors.red}${colors.dim}配置文件已更改，请验证修改项并告知相关干系人${colors.reset}`
          );
          console.log("");
        }
      };

      server.config.logger.warn = (msg: string, opts?: any) => {
        // 保留重要的警告信息
        if (isImportantDevMessage(msg)) {
          originalLoggerWarn(msg, opts);
          return;
        }

        if (shouldBlockMessage(msg)) {
          return;
        }
        originalLoggerWarn(msg, opts);
      };

      // 保持错误输出不变
      server.config.logger.error = originalLoggerError;

      // 拦截 console 输出
      const originalConsoleInfo = console.info;
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;

      // 服务器关闭时恢复原始 console 方法
      server.httpServer?.on('close', () => {
        console.info = originalConsoleInfo;
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
      });

      console.info = (...args) => {
        const msg = args.join(" ");
        if (isImportantDevMessage(msg)) {
          originalConsoleInfo(...args);
          return;
        }
        if (shouldBlockMessage(msg)) return;
        originalConsoleInfo(...args);
      };

      console.log = (...args) => {
        const msg = args.join(" ");
        if (isImportantDevMessage(msg)) {
          originalConsoleLog(...args);
          return;
        }
        if (shouldBlockMessage(msg)) return;
        originalConsoleLog(...args);
      };

      console.warn = (...args) => {
        const msg = args.join(" ");
        if (isImportantDevMessage(msg)) {
          originalConsoleWarn(...args);
          return;
        }
        if (shouldBlockMessage(msg)) return;
        originalConsoleWarn(...args);
      };

      if (!state.hasShownWelcome) {
        server.httpServer?.once("listening", () => {
          // 等待 resolvedUrls 可用后再输出
          const printBanner = () => {
            const version = config.autoVersion
              ? getVersionInfo(server.config.root)
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
            const localUrl = server.resolvedUrls?.local?.[0] || `http://localhost:${server.config.server.port || 5173}/`;
            const networkUrl =
              server.resolvedUrls?.network?.[0] || "需要 --host 参数启用";

            console.log("");
            console.log(`${colors.gray}${"─".repeat(50)}${colors.reset}`);

            // 系统标题
            console.log(
              `${colors.cyan}${colors.bright}🤖 ${config.systemName}${colors.reset} ${colors.gray}${config.description}${colors.reset}`
            );
            console.log("");

            // 服务器信息
            console.log(
              `${colors.white}${colors.bright}⚡ 服务器信息${colors.reset}`
            );
            console.log(
              `   ${colors.green}●${colors.reset} ${colors.white}本地访问${colors.reset}    ${colors.green}${colors.bright}${localUrl}${colors.reset}`
            );

            if (!networkUrl.includes("需要")) {
              console.log(
                `   ${colors.blue}●${colors.reset} ${colors.white}网络访问${colors.reset}    ${colors.blue}${networkUrl}${colors.reset}`
              );
            } else {
              console.log(
                `   ${colors.gray}●${colors.reset} ${colors.white}网络访问${colors.reset}    ${colors.gray}${networkUrl}${colors.reset}`
              );
            }

            if (config.devtools) {
              console.log(
                `   ${colors.magenta}●${colors.reset} ${colors.white}开发工具${colors.reset}    ${colors.magenta}${config.devtools}${colors.reset}`
              );
            }
            console.log("");

            // 项目信息
            console.log(
              `${colors.white}${colors.bright}📦 项目信息${colors.reset}`
            );

            if (config.autoVersion) {
              console.log(
                `   ${colors.green}●${colors.reset} ${colors.white}版本号${colors.reset}      ${colors.green}${colors.bright}v${version}${colors.reset}`
              );
            }

            console.log(
              `   ${colors.blue}●${colors.reset} ${colors.white}启动时间${colors.reset}    ${colors.blue}${currentTime}${colors.reset}`
            );
            console.log(
              `   ${colors.magenta}●${colors.reset} ${colors.white}Git 分支${colors.reset}    ${colors.magenta}${gitInfo.branchStatus}${colors.reset}`
            );
            console.log(
              `   ${colors.yellow}●${colors.reset} ${colors.white}提交哈希${colors.reset}    ${colors.yellow}${gitInfo.commit}${colors.reset}`
            );

            // 团队信息
            if (config.team || config.owner) {
              console.log("");
              console.log(
                `${colors.white}${colors.bright}👥 团队信息${colors.reset}`
              );

              if (config.team) {
                console.log(
                  `   ${colors.blue}●${colors.reset} ${colors.white}架构组${colors.reset}      ${colors.blue}${config.team}${colors.reset}`
                );
              }

              if (config.owner) {
                console.log(
                  `   ${colors.blue}●${colors.reset} ${colors.white}负责人${colors.reset}      ${colors.blue}${config.owner}${colors.reset}`
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
          };

          // 使用短延迟确保 resolvedUrls 已填充
          if (server.resolvedUrls) {
            printBanner();
          } else {
            setTimeout(printBanner, 100);
          }
        });
      }
    },
  };
}