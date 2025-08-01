import type { Plugin } from 'vite'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'

declare global {
  // 避免多实例重复输出
  var __vite_console_plugin_state__: { hasShownWelcome: boolean } | undefined
}

export interface PluginOptions {
  systemName?: string
  description?: string
  team?: string
  owner?: string
  warning?: string
  security?: string
  autoVersion?: boolean
}

export const defaultPluginOptions: Required<PluginOptions> = {
  systemName: 'Robot_Admin',
  description: '后台管理系统',
  team: 'AGILE|TEAM',
  owner: 'CHENY',
  warning: '请勿随意修改配置文件',
  security: '禁止部署未加密的敏感数据',
  autoVersion: true,
}

// 获取版本信息
const getVersionInfo = () => {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
    return packageJson.version || '1.0.0'
  } catch {
    return '1.0.0'
  }
}

// 获取 Git 信息
const getGitInfo = () => {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    const commit = execSync('git rev-parse --short HEAD').toString().trim()
    return { branch, commit }
  } catch {
    return { branch: 'unknown', commit: 'unknown' }
  }
}

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

// 图标定义
const icons = {
  rocket: '🚀',
  package: '📦',
  team: '👥',
  user: '👨‍💻',
  branch: '🌿',
  commit: '🔗',
  warning: '⚠️',
  shield: '🛡️',
  time: '🕐',
  local: '🌐',
  network: '📡',
  devtools: '🔧',
  inspector: '🔍',
}

export default function viteConsolePlugin(options: PluginOptions = {}): Plugin {
  const config = { ...defaultPluginOptions, ...options }
  
  return {
    name: 'vite-console-plugin',
    apply: 'serve',
    configureServer(server) {
      const state = (globalThis.__vite_console_plugin_state__ ||= {
        hasShownWelcome: false,
      })
      const originalInfo = server.config.logger.info.bind(server.config.logger)

      server.config.logger.info = (msg: string, opts?: any) => {
        // 拦截并美化官方的服务器信息
        if (msg.includes('Local:') || msg.includes('Network:') || msg.includes('Vue DevTools') || msg.includes('UnoCSS Inspector')) {
          // 不显示原始信息，我们会在自定义面板中显示
          return
        }
        
        originalInfo(msg, opts)
        
        if (msg.includes('server restarted')) {
          console.log('')
          originalInfo(
            `${colors.yellow}${colors.bright}⚡ 配置重载${colors.reset} ${colors.gray}配置文件已更改，请验证修改项并告知相关干系人${colors.reset}`
          )
          console.log('')
        }
      }

      if (!state.hasShownWelcome) {
        server.httpServer?.once('listening', () => {
          setTimeout(() => {
            const version = config.autoVersion ? getVersionInfo() : config.systemName
            const gitInfo = getGitInfo()
            const currentTime = new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })

            console.log('')
            originalInfo(`${colors.cyan}${colors.bright}╭─────────────────────────────────────────────────╮${colors.reset}`)
            originalInfo(`${colors.cyan}│                                                 │${colors.reset}`)
            originalInfo(`${colors.cyan}│  ${icons.rocket} ${colors.white}${colors.bright}${config.systemName}${colors.reset} ${colors.gray}${config.description}${colors.reset}${' '.repeat(Math.max(0, 35 - config.systemName.length - config.description.length))}${colors.cyan}│${colors.reset}`)
            
            // 获取服务器地址信息
            const serverAddress = server.resolvedUrls?.local?.[0] || 'http://localhost:3000'
            const networkAddress = server.resolvedUrls?.network?.[0] || '未配置网络访问'
            
            originalInfo(`${colors.cyan}│                                                 │${colors.reset}`)
            originalInfo(`${colors.cyan}├─────────────────────────────────────────────────┤${colors.reset}`)
            originalInfo(`${colors.cyan}│  🌐 ${colors.white}本地访问:${colors.reset} ${colors.green}${colors.bright}${serverAddress}${colors.reset}${' '.repeat(Math.max(0, 32 - serverAddress.length))}${colors.cyan}│${colors.reset}`)
            if (networkAddress !== '未配置网络访问') {
              originalInfo(`${colors.cyan}│  📡 ${colors.white}网络访问:${colors.reset} ${colors.blue}${networkAddress}${colors.reset}${' '.repeat(Math.max(0, 32 - networkAddress.length))}${colors.cyan}│${colors.reset}`)
            }
            
            // 开发工具信息
            originalInfo(`${colors.cyan}│  🔧 ${colors.white}Vue DevTools:${colors.reset} ${colors.magenta}已启用${colors.reset}${' '.repeat(26)}${colors.cyan}│${colors.reset}`)
            originalInfo(`${colors.cyan}│  🔍 ${colors.white}UnoCSS Inspector:${colors.reset} ${colors.magenta}已启用${colors.reset}${' '.repeat(21)}${colors.cyan}│${colors.reset}`)
            originalInfo(`${colors.cyan}├─────────────────────────────────────────────────┤${colors.reset}`)
            
            if (config.autoVersion) {
              originalInfo(`${colors.cyan}│  ${icons.package} ${colors.white}版本号:${colors.reset} ${colors.green}${colors.bright}v${version}${colors.reset}${' '.repeat(Math.max(0, 33 - version.length))}${colors.cyan}│${colors.reset}`)
            }
            
            originalInfo(`${colors.cyan}│  ${icons.time} ${colors.white}启动时间:${colors.reset} ${colors.blue}${currentTime}${colors.reset}${' '.repeat(Math.max(0, 24 - currentTime.length))}${colors.cyan}│${colors.reset}`)
            originalInfo(`${colors.cyan}│  ${icons.branch} ${colors.white}分支:${colors.reset} ${colors.magenta}${gitInfo.branch}${colors.reset}${' '.repeat(Math.max(0, 37 - gitInfo.branch.length))}${colors.cyan}│${colors.reset}`)
            originalInfo(`${colors.cyan}│  ${icons.commit} ${colors.white}提交:${colors.reset} ${colors.yellow}${gitInfo.commit}${colors.reset}${' '.repeat(Math.max(0, 37 - gitInfo.commit.length))}${colors.cyan}│${colors.reset}`)
            
            if (config.team) {
              originalInfo(`${colors.cyan}│  ${icons.team} ${colors.white}架构组:${colors.reset} ${colors.blue}${config.team}${colors.reset}${' '.repeat(Math.max(0, 35 - config.team.length))}${colors.cyan}│${colors.reset}`)
            }
            
            if (config.owner) {
              originalInfo(`${colors.cyan}│  ${icons.user} ${colors.white}负责人:${colors.reset} ${colors.blue}${config.owner}${colors.reset}${' '.repeat(Math.max(0, 35 - config.owner.length))}${colors.cyan}│${colors.reset}`)
            }
            
            if (config.warning || config.security) {
              originalInfo(`${colors.cyan}├─────────────────────────────────────────────────┤${colors.reset}`)
              
              if (config.warning) {
                const warningLines = config.warning.match(/.{1,35}/g) || [config.warning]
                warningLines.forEach((line, index) => {
                  const icon = index === 0 ? icons.warning : ' '
                  const label = index === 0 ? '协作警告:' : '        '
                  originalInfo(`${colors.cyan}│  ${colors.yellow}${icon} ${colors.white}${label}${colors.reset} ${colors.yellow}${line}${colors.reset}${' '.repeat(Math.max(0, 32 - label.length - line.length))}${colors.cyan}│${colors.reset}`)
                })
              }
              
              if (config.security) {
                const securityLines = config.security.match(/.{1,35}/g) || [config.security]
                securityLines.forEach((line, index) => {
                  const icon = index === 0 ? icons.shield : ' '
                  const label = index === 0 ? '安全警告:' : '        '
                  originalInfo(`${colors.cyan}│  ${colors.red}${icon} ${colors.white}${label}${colors.reset} ${colors.red}${line}${colors.reset}${' '.repeat(Math.max(0, 32 - label.length - line.length))}${colors.cyan}│${colors.reset}`)
                })
              }
            }
            
            originalInfo(`${colors.cyan}│                                                 │${colors.reset}`)
            originalInfo(`${colors.cyan}╰─────────────────────────────────────────────────╯${colors.reset}`)
            console.log('')
            
            state.hasShownWelcome = true
          }, 350)
        })
      }
    },
  }
}