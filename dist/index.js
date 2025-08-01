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
function viteConsolePlugin(options = {}) {
  const config = { ...defaultPluginOptions, ...options };
  return {
    name: "vite-console-plugin",
    apply: "serve",
    configureServer(server) {
      const state = globalThis.__vite_console_plugin_state__ || (globalThis.__vite_console_plugin_state__ = {
        hasShownWelcome: false
      });
      const originalInfo = server.config.logger.info.bind(server.config.logger);
      server.config.logger.info = (msg, opts) => {
        if (msg.includes("Local:") || msg.includes("Network:") || msg.includes("Vue DevTools") || msg.includes("UnoCSS Inspector")) {
          return;
        }
        originalInfo(msg, opts);
        if (msg.includes("server restarted")) {
          console.log("");
          originalInfo(
            `${colors.yellow}${colors.bright}\u26A1 \u914D\u7F6E\u91CD\u8F7D${colors.reset} ${colors.gray}\u914D\u7F6E\u6587\u4EF6\u5DF2\u66F4\u6539\uFF0C\u8BF7\u9A8C\u8BC1\u4FEE\u6539\u9879\u5E76\u544A\u77E5\u76F8\u5173\u5E72\u7CFB\u4EBA${colors.reset}`
          );
          console.log("");
        }
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
            console.log("");
            originalInfo(`${colors.cyan}${colors.bright}\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E${colors.reset}`);
            originalInfo(`${colors.cyan}\u2502                                                 \u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u2502  ${icons.rocket} ${colors.white}${colors.bright}${config.systemName}${colors.reset} ${colors.gray}${config.description}${colors.reset}${" ".repeat(Math.max(0, 35 - config.systemName.length - config.description.length))}${colors.cyan}\u2502${colors.reset}`);
            const serverAddress = server.resolvedUrls?.local?.[0] || "http://localhost:3000";
            const networkAddress = server.resolvedUrls?.network?.[0] || "\u672A\u914D\u7F6E\u7F51\u7EDC\u8BBF\u95EE";
            originalInfo(`${colors.cyan}\u2502                                                 \u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`);
            originalInfo(`${colors.cyan}\u2502  \u{1F310} ${colors.white}\u672C\u5730\u8BBF\u95EE:${colors.reset} ${colors.green}${colors.bright}${serverAddress}${colors.reset}${" ".repeat(Math.max(0, 32 - serverAddress.length))}${colors.cyan}\u2502${colors.reset}`);
            if (networkAddress !== "\u672A\u914D\u7F6E\u7F51\u7EDC\u8BBF\u95EE") {
              originalInfo(`${colors.cyan}\u2502  \u{1F4E1} ${colors.white}\u7F51\u7EDC\u8BBF\u95EE:${colors.reset} ${colors.blue}${networkAddress}${colors.reset}${" ".repeat(Math.max(0, 32 - networkAddress.length))}${colors.cyan}\u2502${colors.reset}`);
            }
            originalInfo(`${colors.cyan}\u2502  \u{1F527} ${colors.white}Vue DevTools:${colors.reset} ${colors.magenta}\u5DF2\u542F\u7528${colors.reset}${" ".repeat(26)}${colors.cyan}\u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u2502  \u{1F50D} ${colors.white}UnoCSS Inspector:${colors.reset} ${colors.magenta}\u5DF2\u542F\u7528${colors.reset}${" ".repeat(21)}${colors.cyan}\u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`);
            if (config.autoVersion) {
              originalInfo(`${colors.cyan}\u2502  ${icons.package} ${colors.white}\u7248\u672C\u53F7:${colors.reset} ${colors.green}${colors.bright}v${version}${colors.reset}${" ".repeat(Math.max(0, 33 - version.length))}${colors.cyan}\u2502${colors.reset}`);
            }
            originalInfo(`${colors.cyan}\u2502  ${icons.time} ${colors.white}\u542F\u52A8\u65F6\u95F4:${colors.reset} ${colors.blue}${currentTime}${colors.reset}${" ".repeat(Math.max(0, 24 - currentTime.length))}${colors.cyan}\u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u2502  ${icons.branch} ${colors.white}\u5206\u652F:${colors.reset} ${colors.magenta}${gitInfo.branch}${colors.reset}${" ".repeat(Math.max(0, 37 - gitInfo.branch.length))}${colors.cyan}\u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u2502  ${icons.commit} ${colors.white}\u63D0\u4EA4:${colors.reset} ${colors.yellow}${gitInfo.commit}${colors.reset}${" ".repeat(Math.max(0, 37 - gitInfo.commit.length))}${colors.cyan}\u2502${colors.reset}`);
            if (config.team) {
              originalInfo(`${colors.cyan}\u2502  ${icons.team} ${colors.white}\u67B6\u6784\u7EC4:${colors.reset} ${colors.blue}${config.team}${colors.reset}${" ".repeat(Math.max(0, 35 - config.team.length))}${colors.cyan}\u2502${colors.reset}`);
            }
            if (config.owner) {
              originalInfo(`${colors.cyan}\u2502  ${icons.user} ${colors.white}\u8D1F\u8D23\u4EBA:${colors.reset} ${colors.blue}${config.owner}${colors.reset}${" ".repeat(Math.max(0, 35 - config.owner.length))}${colors.cyan}\u2502${colors.reset}`);
            }
            if (config.warning || config.security) {
              originalInfo(`${colors.cyan}\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524${colors.reset}`);
              if (config.warning) {
                const warningLines = config.warning.match(/.{1,35}/g) || [config.warning];
                warningLines.forEach((line, index) => {
                  const icon = index === 0 ? icons.warning : " ";
                  const label = index === 0 ? "\u534F\u4F5C\u8B66\u544A:" : "        ";
                  originalInfo(`${colors.cyan}\u2502  ${colors.yellow}${icon} ${colors.white}${label}${colors.reset} ${colors.yellow}${line}${colors.reset}${" ".repeat(Math.max(0, 32 - label.length - line.length))}${colors.cyan}\u2502${colors.reset}`);
                });
              }
              if (config.security) {
                const securityLines = config.security.match(/.{1,35}/g) || [config.security];
                securityLines.forEach((line, index) => {
                  const icon = index === 0 ? icons.shield : " ";
                  const label = index === 0 ? "\u5B89\u5168\u8B66\u544A:" : "        ";
                  originalInfo(`${colors.cyan}\u2502  ${colors.red}${icon} ${colors.white}${label}${colors.reset} ${colors.red}${line}${colors.reset}${" ".repeat(Math.max(0, 32 - label.length - line.length))}${colors.cyan}\u2502${colors.reset}`);
                });
              }
            }
            originalInfo(`${colors.cyan}\u2502                                                 \u2502${colors.reset}`);
            originalInfo(`${colors.cyan}\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F${colors.reset}`);
            console.log("");
            state.hasShownWelcome = true;
          }, 350);
        });
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultPluginOptions
});
