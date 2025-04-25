import type { Plugin } from 'vite'

declare global {
  // 避免多实例重复输出
  var __vite_console_plugin_state__: { hasShownWelcome: boolean } | undefined
}

export interface PluginOptions {
  systemName?: string
  version?: string
  team?: string
  owner?: string
  warning?: string
  security?: string
}

export const defaultPluginOptions: Required<PluginOptions> = {
  systemName: 'Robot_Admin',
  version: '1.0.0',
  team: 'AGILE|TEAM',
  owner: 'CHENY',
  warning: '请勿随意修改配置文件',
  security: '禁止部署未加密的敏感数据',
}

export default function viteConsolePlugin(options: PluginOptions = {}): Plugin {
  return {
    name: 'vite-console-plugin',
    apply: 'serve',
    configureServer(server) {
      const state = (globalThis.__vite_console_plugin_state__ ||= {
        hasShownWelcome: false,
      })
      const originalInfo = server.config.logger.info.bind(server.config.logger)

      server.config.logger.info = (msg: string, opts?: any) => {
        originalInfo(msg, opts)
        if (msg.includes('server restarted')) {
          originalInfo(
            '\x1b[93m➜  \x1b[37m配置变更:\x1b[91m 配置文件已更改，请验证修改项并，告知相关干系人。\x1b[0m'
          )
        }
      }

      if (!state.hasShownWelcome) {
        server.httpServer?.once('listening', () => {
          setTimeout(() => {
            originalInfo(
              '\x1b[36m═══════════════════════════════════════\x1b[0m'
            )
            originalInfo(
              `\x1b[36m  ➜  系统名称: \x1b[34m${
                options.systemName || '未命名系统'
              }\x1b[0m`
            )
            originalInfo(
              `\x1b[36m  ➜  版本号:   \x1b[34m${
                options.version || '未指定版本'
              }\x1b[0m`
            )
            if (options.team)
              originalInfo(
                `\x1b[36m  ➜  架构组:   \x1b[34m${options.team}\x1b[0m`
              )
            if (options.owner)
              originalInfo(
                `\x1b[36m  ➜  负责人:   \x1b[34m${options.owner}\x1b[0m`
              )
            if (options.warning)
              originalInfo(`\x1b[31m  ➜  协作警告: ${options.warning}\x1b[0m`)
            if (options.security)
              originalInfo(`\x1b[31m  ➜  安全警告: ${options.security}\x1b[0m`)
            originalInfo(
              '\x1b[36m═══════════════════════════════════════\x1b[0m'
            )
            state.hasShownWelcome = true
          }, 350)
        })
      }
    },
  }
}
