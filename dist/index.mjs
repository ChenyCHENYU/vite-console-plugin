// src/index.ts
import { readFileSync } from "fs";
import { execSync } from "child_process";
var defaultPluginOptions = {
  systemName: "Robot_Admin",
  description: "\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF",
  team: "AGILE|TEAM",
  owner: "CHENY",
  warning: "\u8BF7\u52FF\u968F\u610F\u4FEE\u6539\u914D\u7F6E\u6587\u4EF6",
  security: "\u7981\u6B62\u90E8\u7F72\u672A\u52A0\u5BC6\u7684\u654F\u611F\u6570\u636E",
  autoVersion: true
};
var getVersionInfo = () => {
  try {
    const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
    return packageJson.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
};
var getGitInfo = () => {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const commit = execSync("git rev-parse --short HEAD").toString().trim();
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
      branchStatus: "unknown (\u79BB\u7EBF\u72B6\u6001 \u{1F4F1})"
    };
  }
};
var getGitStatus = (currentBranch) => {
  try {
    execSync("git remote", { stdio: "pipe" });
    let statusParts = [];
    const remoteBranch = `origin/${currentBranch}`;
    try {
      execSync(`git show-ref --verify --quiet refs/remotes/${remoteBranch}`, { stdio: "pipe" });
      const behindCount = execSync(`git rev-list --count HEAD..${remoteBranch}`, { stdio: "pipe" }).toString().trim();
      const aheadCount = execSync(`git rev-list --count ${remoteBranch}..HEAD`, { stdio: "pipe" }).toString().trim();
      if (behindCount === "0" && aheadCount === "0") {
        statusParts.push("\u4E0E\u8FDC\u7A0B\u540C\u6B65 \u2705");
      } else if (behindCount > "0" && aheadCount === "0") {
        statusParts.push(`\u843D\u540E\u8FDC\u7A0B ${behindCount} \u4E2A\u63D0\u4EA4 \u{1F504}`);
      } else if (behindCount === "0" && aheadCount > "0") {
        statusParts.push(`\u9886\u5148\u8FDC\u7A0B ${aheadCount} \u4E2A\u63D0\u4EA4 \u2B06\uFE0F`);
      } else {
        statusParts.push(`\u5206\u53C9\u72B6\u6001 \u{1F500}`);
      }
    } catch {
      statusParts.push("\u672C\u5730\u5206\u652F \u{1F4F1}");
    }
    if (currentBranch !== "main" && currentBranch !== "master") {
      try {
        let mainBranch = "origin/main";
        try {
          execSync(`git show-ref --verify --quiet refs/remotes/origin/main`, { stdio: "pipe" });
        } catch {
          try {
            execSync(`git show-ref --verify --quiet refs/remotes/origin/master`, { stdio: "pipe" });
            mainBranch = "origin/master";
          } catch {
            throw new Error("No main branch found");
          }
        }
        const mergeBase = execSync(`git merge-base HEAD ${mainBranch}`, { stdio: "pipe" }).toString().trim();
        const aheadOfMain = execSync(`git rev-list --count ${mergeBase}..HEAD`, { stdio: "pipe" }).toString().trim();
        const behindMain = execSync(`git rev-list --count HEAD..${mainBranch}`, { stdio: "pipe" }).toString().trim();
        if (aheadOfMain === "0" && behindMain === "0") {
          statusParts.push("\u57FA\u4E8E main \u6700\u65B0\u4EE3\u7801 \u2705");
        } else if (aheadOfMain > "0") {
          statusParts.push(`\u9886\u5148 main ${aheadOfMain} \u4E2A\u63D0\u4EA4 \u2B06\uFE0F`);
        }
        if (behindMain > "0") {
          statusParts[statusParts.length - 1] = statusParts[statusParts.length - 1].replace(" \u2B06\uFE0F", "") + ` (main \u9886\u5148 ${behindMain} \u4E2A\u63D0\u4EA4) \u{1F504}`;
        }
      } catch {
      }
    }
    return `${currentBranch} (${statusParts.join(" | ")})`;
  } catch {
    return `${currentBranch} (\u79BB\u7EBF\u72B6\u6001 \u{1F4F1})`;
  }
};
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  cyan: "\x1B[36m",
  blue: "\x1B[34m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  red: "\x1B[31m",
  magenta: "\x1B[35m",
  white: "\x1B[37m",
  gray: "\x1B[90m"
};
function shouldBlockMessage(msg) {
  const cleanMsg = msg.replace(/\x1b\[[0-9;]*m/g, "").trim();
  const blockPatterns = [
    /^➜\s+Local:\s+http:\/\/.*$/,
    // Local 地址
    /^➜\s+Network:\s+use\s+--host\s+to\s+expose.*$/,
    // Network 提示  
    /^➜\s+press\s+h\s+\+\s+enter\s+to\s+show\s+help.*$/,
    // 帮助提示
    /^➜\s+Vue DevTools:/,
    // Vue DevTools 相关
    /^➜\s+UnoCSS Inspector:/,
    // UnoCSS Inspector
    /Local:\s+http:\/\/.*$/,
    // 不带 ➜ 的 Local
    /Network:\s+use\s+--host\s+to\s+expose/,
    // 不带 ➜ 的 Network
    /press\s+h\s+\+\s+enter\s+to\s+show\s+help/,
    // 不带 ➜ 的帮助
    /use\s+--host\s+to\s+expose/,
    // host 参数提示
    /Press\s+Alt\s+\+\s+Shift\s+\+\s+D/,
    // Vue DevTools 快捷键
    /Open\s+http:\/\/[^\/]+\/__devtools__\//,
    // DevTools 窗口提示
    /as\s+a\s+separate\s+window/,
    // 窗口提示
    /to\s+toggle\s+the\s+Vue\s+DevTools/,
    // DevTools 切换提示
    /__devtools__/,
    // DevTools 路径
    /__unocss/
    // UnoCSS 路径
  ];
  return blockPatterns.some((pattern) => pattern.test(cleanMsg));
}
function isImportantDevMessage(msg) {
  const importantPatterns = [
    /ready\s+in\s+\d+ms/i,
    // 构建完成时间
    /built\s+in\s+\d+ms/i,
    // 构建耗时
    /server\s+restarted/i,
    // 服务器重启
    /hmr\s+update/i,
    // HMR 更新
    /page\s+reload/i,
    // 页面重载
    /\d+\s+modules?\s+transformed/i,
    // 模块转换
    /vite\s+v\d+\.\d+\.\d+/i,
    // Vite 版本信息
    /dev\s+server\s+running/i,
    // 开发服务器状态
    /optimizing\s+dependencies/i,
    // 依赖优化
    /dependencies\s+optimized/i
    // 依赖优化完成
  ];
  return importantPatterns.some((pattern) => pattern.test(msg));
}
function viteConsolePlugin(options = {}) {
  const config = { ...defaultPluginOptions, ...options };
  return {
    name: "vite-console-plugin",
    apply: "serve",
    config(userConfig) {
      userConfig.clearScreen = false;
    },
    configureServer(server) {
      const state = globalThis.__vite_console_plugin_state__ || (globalThis.__vite_console_plugin_state__ = {
        hasShownWelcome: false
      });
      const originalLoggerInfo = server.config.logger.info.bind(
        server.config.logger
      );
      const originalLoggerWarn = server.config.logger.warn.bind(
        server.config.logger
      );
      const originalLoggerError = server.config.logger.error.bind(
        server.config.logger
      );
      server.config.logger.info = (msg, opts) => {
        if (isImportantDevMessage(msg)) {
          originalLoggerInfo(msg, opts);
          return;
        }
        if (shouldBlockMessage(msg)) {
          return;
        }
        originalLoggerInfo(msg, opts);
        if (msg.includes("server restarted")) {
          console.log("");
          console.log(
            `${colors.yellow}${colors.dim}\u26A1 \u914D\u7F6E\u91CD\u8F7D${colors.reset} ${colors.red}${colors.dim}\u914D\u7F6E\u6587\u4EF6\u5DF2\u66F4\u6539\uFF0C\u8BF7\u9A8C\u8BC1\u4FEE\u6539\u9879\u5E76\u544A\u77E5\u76F8\u5173\u5E72\u7CFB\u4EBA${colors.reset}`
          );
          console.log("");
        }
      };
      server.config.logger.warn = (msg, opts) => {
        if (isImportantDevMessage(msg)) {
          originalLoggerWarn(msg, opts);
          return;
        }
        if (shouldBlockMessage(msg)) {
          return;
        }
        originalLoggerWarn(msg, opts);
      };
      server.config.logger.error = originalLoggerError;
      const originalConsoleInfo = console.info;
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
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
          setTimeout(() => {
            const version = config.autoVersion ? getVersionInfo() : config.systemName;
            const gitInfo = getGitInfo();
            const currentTime = (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            });
            const port = server.config.server.port || 3e3;
            const host = server.config.server.host || "localhost";
            const localUrl = `http://${host}:${port}/`;
            const networkUrl = server.resolvedUrls?.network?.[0] || "\u9700\u8981 --host \u53C2\u6570\u542F\u7528";
            console.log("");
            console.log(`${colors.gray}${"\u2500".repeat(50)}${colors.reset}`);
            console.log(
              `${colors.cyan}${colors.bright}\u{1F916} ${config.systemName}${colors.reset} ${colors.gray}${config.description}${colors.reset}`
            );
            console.log("");
            console.log(
              `${colors.white}${colors.bright}\u26A1 \u670D\u52A1\u5668\u4FE1\u606F${colors.reset}`
            );
            console.log(
              `   ${colors.green}\u25CF${colors.reset} ${colors.white}\u672C\u5730\u8BBF\u95EE${colors.reset}   ${colors.green}${colors.bright}${localUrl}${colors.reset}`
            );
            if (!networkUrl.includes("\u9700\u8981")) {
              console.log(
                `   ${colors.blue}\u25CF${colors.reset} ${colors.white}\u7F51\u7EDC\u8BBF\u95EE${colors.reset}   ${colors.blue}${networkUrl}${colors.reset}`
              );
            } else {
              console.log(
                `   ${colors.gray}\u25CF${colors.reset} ${colors.white}\u7F51\u7EDC\u8BBF\u95EE${colors.reset}   ${colors.gray}${networkUrl}${colors.reset}`
              );
            }
            console.log(
              `   ${colors.magenta}\u25CF${colors.reset} ${colors.white}\u5F00\u53D1\u5DE5\u5177${colors.reset}   ${colors.magenta}Vue DevTools & UnoCSS Inspector${colors.reset}`
            );
            console.log("");
            console.log(
              `${colors.white}${colors.bright}\u{1F4E6} \u9879\u76EE\u4FE1\u606F${colors.reset}`
            );
            if (config.autoVersion) {
              console.log(
                `   ${colors.green}\u25CF${colors.reset} ${colors.white}\u7248\u672C\u53F7${colors.reset}       ${colors.green}${colors.bright}v${version}${colors.reset}`
              );
            }
            console.log(
              `   ${colors.blue}\u25CF${colors.reset} ${colors.white}\u542F\u52A8\u65F6\u95F4${colors.reset}     ${colors.blue}${currentTime}${colors.reset}`
            );
            console.log(
              `   ${colors.magenta}\u25CF${colors.reset} ${colors.white}Git \u5206\u652F${colors.reset}     ${colors.magenta}${gitInfo.branchStatus}${colors.reset}`
            );
            console.log(
              `   ${colors.yellow}\u25CF${colors.reset} ${colors.white}\u63D0\u4EA4\u54C8\u5E0C${colors.reset}     ${colors.yellow}${gitInfo.commit}${colors.reset}`
            );
            if (config.team || config.owner) {
              console.log("");
              console.log(
                `${colors.white}${colors.bright}\u{1F465} \u56E2\u961F\u4FE1\u606F${colors.reset}`
              );
              if (config.team) {
                console.log(
                  `   ${colors.blue}\u25CF${colors.reset} ${colors.white}\u67B6\u6784\u7EC4${colors.reset}       ${colors.blue}${config.team}${colors.reset}`
                );
              }
              if (config.owner) {
                console.log(
                  `   ${colors.blue}\u25CF${colors.reset} ${colors.white}\u8D1F\u8D23\u4EBA${colors.reset}       ${colors.blue}${config.owner}${colors.reset}`
                );
              }
            }
            if (config.warning || config.security) {
              console.log("");
              console.log(
                `${colors.white}${colors.bright}\u26A0\uFE0F  \u91CD\u8981\u63D0\u9192${colors.reset}`
              );
              if (config.warning) {
                console.log(
                  `   ${colors.yellow}\u25CF${colors.reset} ${colors.yellow}${config.warning}${colors.reset}`
                );
              }
              if (config.security) {
                console.log(
                  `   ${colors.red}\u25CF${colors.reset} ${colors.red}${config.security}${colors.reset}`
                );
              }
            }
            console.log("");
            console.log(
              `${colors.green}${colors.bright}\u2728 \u542F\u52A8\u6210\u529F\uFF01${colors.reset} ${colors.gray}\u5F00\u53D1\u670D\u52A1\u5668\u5DF2\u5C31\u7EEA${colors.reset}`
            );
            console.log(`${colors.gray}${"\u2500".repeat(50)}${colors.reset}`);
            console.log("");
            state.hasShownWelcome = true;
          }, 350);
        });
      }
    }
  };
}
export {
  viteConsolePlugin as default,
  defaultPluginOptions
};
