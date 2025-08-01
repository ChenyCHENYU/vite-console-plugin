"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => viteConsolePlugin,
  defaultPluginOptions: () => defaultPluginOptions
});
module.exports = __toCommonJS(index_exports);
var import_fs = require("fs");
var import_child_process = require("child_process");
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
    const packageJson = JSON.parse((0, import_fs.readFileSync)("package.json", "utf-8"));
    return packageJson.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
};
var getGitInfo = () => {
  try {
    const branch = (0, import_child_process.execSync)("git rev-parse --abbrev-ref HEAD").toString().trim();
    const commit = (0, import_child_process.execSync)("git rev-parse --short HEAD").toString().trim();
    return { branch, commit };
  } catch {
    return { branch: "unknown", commit: "unknown" };
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
var icons = {
  rocket: "\u{1F680}",
  package: "\u{1F4E6}",
  team: "\u{1F465}",
  user: "\u{1F468}\u200D\u{1F4BB}",
  branch: "\u{1F33F}",
  commit: "\u{1F517}",
  warning: "\u26A0\uFE0F",
  shield: "\u{1F6E1}\uFE0F",
  time: "\u{1F550}",
  local: "\u{1F310}",
  network: "\u{1F4E1}",
  devtools: "\u{1F527}",
  inspector: "\u{1F50D}"
};
function shouldBlockMessage(msg) {
  if (msg.includes("hmr update") || msg.includes("page reload") || msg.includes("[vite]") && (msg.includes("update") || msg.includes("reload"))) {
    return false;
  }
  return msg.includes("Local:") || msg.includes("Network:") || msg.includes("Vue DevTools") || msg.includes("UnoCSS Inspector") || msg.includes("press h + enter") || msg.includes("use --host to expose") || msg.includes("Press Alt") || msg.includes("Open http://") || msg.includes("__devtools__") || msg.includes("__unocss") || msg.includes("as a separate window") || msg.includes("to toggle the Vue DevTools") || msg.includes("\u279C  Local:") || msg.includes("\u279C  Network:");
}
function viteConsolePlugin(options = {}) {
  const config = { ...defaultPluginOptions, ...options };
  return {
    name: "vite-console-plugin",
    apply: "serve",
    config(userConfig) {
      userConfig.logLevel = "silent";
      userConfig.clearScreen = false;
    },
    configureServer(server) {
      const state = globalThis.__vite_console_plugin_state__ || (globalThis.__vite_console_plugin_state__ = {
        hasShownWelcome: false
      });
      const originalConsoleLog = console.log;
      const originalConsoleInfo = console.info;
      const originalConsoleWarn = console.warn;
      console.log = (...args) => {
        const msg = args.join(" ");
        if (shouldBlockMessage(msg)) return;
        originalConsoleLog(...args);
      };
      console.info = (...args) => {
        const msg = args.join(" ");
        if (shouldBlockMessage(msg)) return;
        originalConsoleInfo(...args);
      };
      console.warn = (...args) => {
        const msg = args.join(" ");
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
            console.log(
              `${colors.cyan}${colors.bright}\u250C\u2500 ${colors.white}${config.systemName}${colors.reset} ${colors.gray}${config.description}${colors.reset} ${colors.cyan}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u2502${colors.reset}                                                 ${colors.cyan}\u2502${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u251C\u2500 ${colors.white}${colors.bright}\u670D\u52A1\u5668\u4FE1\u606F${colors.reset} ${colors.cyan}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u2502${colors.reset}  ${colors.green}\u25CF${colors.reset} ${colors.white}\u672C\u5730\u8BBF\u95EE${colors.reset}   ${colors.green}${colors.bright}${localUrl}${colors.reset}${" ".repeat(
                Math.max(0, 24 - localUrl.length)
              )} ${colors.cyan}\u2502${colors.reset}`
            );
            if (!networkUrl.includes("\u9700\u8981")) {
              console.log(
                `${colors.cyan}\u2502${colors.reset}  ${colors.blue}\u25CF${colors.reset} ${colors.white}\u7F51\u7EDC\u8BBF\u95EE${colors.reset}   ${colors.blue}${networkUrl}${colors.reset}${" ".repeat(
                  Math.max(0, 24 - networkUrl.length)
                )} ${colors.cyan}\u2502${colors.reset}`
              );
            } else {
              console.log(
                `${colors.cyan}\u2502${colors.reset}  ${colors.gray}\u25CF${colors.reset} ${colors.white}\u7F51\u7EDC\u8BBF\u95EE${colors.reset}   ${colors.gray}${networkUrl}${colors.reset}${" ".repeat(
                  Math.max(0, 24 - networkUrl.length)
                )} ${colors.cyan}\u2502${colors.reset}`
              );
            }
            console.log(
              `${colors.cyan}\u2502${colors.reset}  ${colors.magenta}\u25CF${colors.reset} ${colors.white}\u5F00\u53D1\u5DE5\u5177${colors.reset}   ${colors.magenta}Vue DevTools & UnoCSS Inspector${colors.reset} ${colors.cyan}\u2502${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u251C\u2500 ${colors.white}${colors.bright}\u9879\u76EE\u4FE1\u606F${colors.reset} ${colors.cyan}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`
            );
            if (config.autoVersion) {
              console.log(
                `${colors.cyan}\u2502${colors.reset}  ${colors.green}${icons.package}${colors.reset} ${colors.white}\u7248\u672C\u53F7${colors.reset}     ${colors.green}${colors.bright}v${version}${colors.reset}${" ".repeat(
                  Math.max(0, 25 - version.length)
                )} ${colors.cyan}\u2502${colors.reset}`
              );
            }
            console.log(
              `${colors.cyan}\u2502${colors.reset}  ${colors.blue}${icons.time}${colors.reset} ${colors.white}\u542F\u52A8\u65F6\u95F4${colors.reset}   ${colors.blue}${currentTime}${colors.reset}${" ".repeat(
                Math.max(0, 16 - currentTime.length)
              )} ${colors.cyan}\u2502${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u2502${colors.reset}  ${colors.magenta}${icons.branch}${colors.reset} ${colors.white}Git \u5206\u652F${colors.reset}   ${colors.magenta}${gitInfo.branch}${colors.reset}${" ".repeat(
                Math.max(0, 24 - gitInfo.branch.length)
              )} ${colors.cyan}\u2502${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u2502${colors.reset}  ${colors.yellow}${icons.commit}${colors.reset} ${colors.white}\u63D0\u4EA4\u54C8\u5E0C${colors.reset}   ${colors.yellow}${gitInfo.commit}${colors.reset}${" ".repeat(
                Math.max(0, 24 - gitInfo.commit.length)
              )} ${colors.cyan}\u2502${colors.reset}`
            );
            if (config.team || config.owner) {
              console.log(
                `${colors.cyan}\u251C\u2500 ${colors.white}${colors.bright}\u56E2\u961F\u4FE1\u606F${colors.reset} ${colors.cyan}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`
              );
              if (config.team) {
                console.log(
                  `${colors.cyan}\u2502${colors.reset}  ${colors.blue}${icons.team}${colors.reset} ${colors.white}\u67B6\u6784\u7EC4${colors.reset}     ${colors.blue}${config.team}${colors.reset}${" ".repeat(
                    Math.max(0, 27 - config.team.length)
                  )} ${colors.cyan}\u2502${colors.reset}`
                );
              }
              if (config.owner) {
                console.log(
                  `${colors.cyan}\u2502${colors.reset}  ${colors.blue}${icons.user}${colors.reset} ${colors.white}\u8D1F\u8D23\u4EBA${colors.reset}     ${colors.blue}${config.owner}${colors.reset}${" ".repeat(
                    Math.max(0, 27 - config.owner.length)
                  )} ${colors.cyan}\u2502${colors.reset}`
                );
              }
            }
            if (config.warning || config.security) {
              console.log(
                `${colors.cyan}\u251C\u2500 ${colors.white}${colors.bright}\u91CD\u8981\u63D0\u9192${colors.reset} ${colors.cyan}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`
              );
              if (config.warning) {
                console.log(
                  `${colors.cyan}\u2502${colors.reset}  ${colors.yellow}${icons.warning}${colors.reset} ${colors.yellow}${config.warning}${colors.reset}${" ".repeat(Math.max(0, 40 - config.warning.length))} ${colors.cyan}\u2502${colors.reset}`
                );
              }
              if (config.security) {
                console.log(
                  `${colors.cyan}\u2502${colors.reset}  ${colors.red}${icons.shield}${colors.reset} ${colors.red}${config.security}${colors.reset}${" ".repeat(Math.max(0, 40 - config.security.length))} ${colors.cyan}\u2502${colors.reset}`
                );
              }
            }
            console.log(
              `${colors.cyan}\u2502${colors.reset}                                                 ${colors.cyan}\u2502${colors.reset}`
            );
            console.log(
              `${colors.cyan}\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518${colors.reset}`
            );
            console.log("");
            console.log(
              `${colors.green}${colors.bright}\u2728 \u542F\u52A8\u6210\u529F\uFF01${colors.reset} ${colors.gray}\u5F00\u53D1\u670D\u52A1\u5668\u5DF2\u5C31\u7EEA\uFF0C\u5F00\u59CB\u6109\u5FEB\u5730\u5F00\u53D1\u5427~ ${colors.green}\u{1F680}${colors.reset}`
            );
            console.log("");
            state.hasShownWelcome = true;
          }, 350);
        });
      }
      const originalInfo = server.config.logger.info.bind(server.config.logger);
      server.config.logger.info = (msg, opts) => {
        if (msg.includes("server restarted")) {
          console.log("");
          console.log(
            `${colors.yellow}${colors.bright}\u26A1 \u914D\u7F6E\u91CD\u8F7D${colors.reset} ${colors.gray}\u914D\u7F6E\u6587\u4EF6\u5DF2\u66F4\u6539\uFF0C\u8BF7\u9A8C\u8BC1\u4FEE\u6539\u9879\u5E76\u544A\u77E5\u76F8\u5173\u5E72\u7CFB\u4EBA${colors.reset}`
          );
          console.log("");
        }
      };
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultPluginOptions
});
