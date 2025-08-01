// src/index.ts
var defaultPluginOptions = {
  systemName: "Robot_Admin",
  version: "1.0.0",
  team: "AGILE|TEAM",
  owner: "CHENY",
  warning: "\u8BF7\u52FF\u968F\u610F\u4FEE\u6539\u914D\u7F6E\u6587\u4EF6",
  security: "\u7981\u6B62\u90E8\u7F72\u672A\u52A0\u5BC6\u7684\u654F\u611F\u6570\u636E"
};
function viteConsolePlugin(options = {}) {
  return {
    name: "vite-console-plugin",
    apply: "serve",
    configureServer(server) {
      const state = globalThis.__vite_console_plugin_state__ || (globalThis.__vite_console_plugin_state__ = {
        hasShownWelcome: false
      });
      const originalInfo = server.config.logger.info.bind(server.config.logger);
      server.config.logger.info = (msg, opts) => {
        originalInfo(msg, opts);
        if (msg.includes("server restarted")) {
          originalInfo(
            "\x1B[93m\u279C  \x1B[37m\u914D\u7F6E\u53D8\u66F4:\x1B[91m \u914D\u7F6E\u6587\u4EF6\u5DF2\u66F4\u6539\uFF0C\u8BF7\u9A8C\u8BC1\u4FEE\u6539\u9879\u5E76\uFF0C\u544A\u77E5\u76F8\u5173\u5E72\u7CFB\u4EBA\u3002\x1B[0m"
          );
        }
      };
      if (!state.hasShownWelcome) {
        server.httpServer?.once("listening", () => {
          setTimeout(() => {
            originalInfo(
              "\x1B[36m\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\x1B[0m"
            );
            originalInfo(
              `\x1B[36m  \u279C  \u7CFB\u7EDF\u540D\u79F0: \x1B[34m${options.systemName || "\u672A\u547D\u540D\u7CFB\u7EDF"}\x1B[0m`
            );
            originalInfo(
              `\x1B[36m  \u279C  \u7248\u672C\u53F7:   \x1B[34m${options.version || "\u672A\u6307\u5B9A\u7248\u672C"}\x1B[0m`
            );
            if (options.team)
              originalInfo(
                `\x1B[36m  \u279C  \u67B6\u6784\u7EC4:   \x1B[34m${options.team}\x1B[0m`
              );
            if (options.owner)
              originalInfo(
                `\x1B[36m  \u279C  \u8D1F\u8D23\u4EBA:   \x1B[34m${options.owner}\x1B[0m`
              );
            if (options.warning)
              originalInfo(`\x1B[31m  \u279C  \u534F\u4F5C\u8B66\u544A: ${options.warning}\x1B[0m`);
            if (options.security)
              originalInfo(`\x1B[31m  \u279C  \u5B89\u5168\u8B66\u544A: ${options.security}\x1B[0m`);
            originalInfo(
              "\x1B[36m\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\x1B[0m"
            );
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
