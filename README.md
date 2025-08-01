# Vite Console Plugin

> 🚀 一个精美的 Vite 开发服务器启动信息插件，提供企业级的终端输出体验

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-green.svg)](https://vitejs.dev/)

## ✨ 特性

- 🎨 **精美的视觉效果** - 使用丰富的颜色和图标打造专业级启动界面
- 🔧 **智能信息整合** - 自动获取版本号、Git 信息、服务器地址等开发信息
- 🚫 **原生信息屏蔽** - 智能屏蔽 Vite 原生的杂乱输出，保留重要开发信息
- ⚡ **零配置使用** - 开箱即用，同时支持灵活的自定义配置
- 📦 **自动版本读取** - 自动从 `package.json` 读取最新版本信息
- 🌿 **Git 集成** - 显示当前分支和提交哈希，便于开发调试
- 🛡️ **团队协作** - 支持团队信息、警告提示等协作功能
- 🔄 **配置重载提醒** - 配置文件更改时提供友好的重载提示

## 📦 安装

```bash
npm install vite-console-plugin --save-dev
# 或
yarn add vite-console-plugin -D
# 或
pnpm add vite-console-plugin -D
```

## 🚀 快速开始

### 基础使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import viteConsolePlugin from 'vite-console-plugin'

export default defineConfig({
  plugins: [
    viteConsolePlugin({
      systemName: 'My App',
      description: '我的应用系统',
      owner: 'Your Name'
    })
  ]
})
```

### 完整配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import viteConsolePlugin from 'vite-console-plugin'

export default defineConfig({
  plugins: [
    viteConsolePlugin({
      systemName: 'Robot_Admin',
      description: '后台管理系统',
      team: 'AGILE|TEAM',
      owner: 'CHENY',
      warning: '请勿随意修改配置文件',
      security: '禁止部署未加密的敏感数据',
      autoVersion: true
    })
  ]
})
```

## 📋 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `systemName` | `string` | `'Robot_Admin'` | 系统名称 |
| `description` | `string` | `'后台管理系统'` | 系统描述 |
| `team` | `string` | `'AGILE\|TEAM'` | 团队名称 |
| `owner` | `string` | `'CHENY'` | 项目负责人 |
| `warning` | `string` | `'请勿随意修改配置文件'` | 协作警告信息 |
| `security` | `string` | `'禁止部署未加密的敏感数据'` | 安全警告信息 |
| `autoVersion` | `boolean` | `true` | 是否自动读取 package.json 版本 |

## 🎨 输出效果

### 启动时的完整输出

```
──────────────────────────────────────────────────

🚀 Robot_Admin 后台管理系统

⚡ 服务器信息
   ● 本地访问   http://localhost:3000/
   ● 网络访问   http://192.168.1.100:3000/
   ● 开发工具   Vue DevTools & UnoCSS Inspector

📦 项目信息
   ● 版本号       v1.2.3
   ● 启动时间     2025-08-01 10:30:45
   ● Git 分支     main
   ● 提交哈希     a1b2c3d

👥 团队信息
   ● 架构组       AGILE|TEAM
   ● 负责人       CHENY

⚠️  重要提醒
   ● 请勿随意修改配置文件
   ● 禁止部署未加密的敏感数据

✨ 启动成功！ 开发服务器已就绪
──────────────────────────────────────────────────
```

### 配置重载提示

```
⚡ 配置重载 配置文件已更改，请验证修改项并告知相关干系人
```

## 🔍 功能详解

### 自动信息获取

插件会自动获取以下信息：

- **版本号**: 从 `package.json` 自动读取，失败时默认为 `1.0.0`
- **Git 分支**: 通过 `git rev-parse --abbrev-ref HEAD` 获取当前分支
- **Git 提交**: 通过 `git rev-parse --short HEAD` 获取最新提交的短哈希
- **服务器地址**: 自动获取本地和网络访问地址
- **启动时间**: 服务器启动的具体时间（中文格式）

### 智能信息屏蔽

插件会智能屏蔽 Vite 原生的以下输出，但保留重要的开发信息：

**屏蔽的信息：**
- `➜ Local: http://localhost:xxxx/`
- `➜ Network: use --host to expose`
- `➜ Vue DevTools: Open http://...`
- `➜ UnoCSS Inspector: http://...`
- `➜ press h + enter to show help`
- DevTools 相关的所有 URL 和快捷键提示

**保留的重要信息：**
- `ready in Xms` - 构建完成时间
- `built in Xms` - 构建耗时
- `server restarted` - 服务器重启
- `hmr update` - HMR 更新
- `dependencies optimized` - 依赖优化完成
- 所有错误和警告信息

### 颜色和图标系统

插件使用丰富的 ANSI 颜色和 Unicode 图标：

**颜色方案：**
- 🟢 绿色：成功状态和本地地址
- 🔵 蓝色：信息和网络地址  
- 🟡 黄色：警告和提交信息
- 🔴 红色：安全警告
- 🟣 紫色：开发工具和分支信息
- ⚪ 白色：标题和重要信息
- 🔘 灰色：分隔线和次要信息

**图标系统：**
- 🚀 系统启动
- 📦 项目信息
- 👥 团队信息
- ⚠️ 重要提醒
- ⚡ 服务器状态
- 🛡️ 安全提醒

## 🎯 最佳实践

### 团队协作配置

```typescript
viteConsolePlugin({
  systemName: 'TeamProject',
  description: '团队协作项目',
  team: 'Frontend Team',
  owner: '项目负责人',
  warning: '修改配置前请通知团队成员',
  security: '生产环境注意数据安全',
  autoVersion: true
})
```

### 个人项目配置

```typescript
viteConsolePlugin({
  systemName: 'Personal Project',
  description: '个人开发项目',
  owner: 'Your Name',
  autoVersion: true,
  // 个人项目可以简化警告信息
  warning: '注意代码规范',
  security: '保护敏感信息'
})
```

### 最小化配置

```typescript
viteConsolePlugin({
  systemName: 'Simple App'
  // 其他选项将使用默认值
})
```

## 🛠️ 技术实现

### 核心特性

- **Logger 重写**: 通过重写 `server.config.logger.info/warn` 实现信息拦截
- **Console 拦截**: 同时拦截 `console.log/info/warn` 确保完整屏蔽
- **状态管理**: 使用 `globalThis.__vite_console_plugin_state__` 避免多实例重复输出
- **延迟显示**: 使用 350ms 延迟确保服务器完全启动后再显示信息
- **正则匹配**: 通过多个正则表达式精确匹配需要屏蔽的信息模式
- **错误处理**: 所有外部命令调用都有完善的错误处理机制

### 消息过滤逻辑

```typescript
// 屏蔽判断 - 清理 ANSI 颜色代码后进行模式匹配
function shouldBlockMessage(msg: string): boolean {
  const cleanMsg = msg.replace(/\x1b\[[0-9;]*m/g, '').trim();
  // 匹配多种屏蔽模式...
}

// 重要信息判断 - 保留对开发有价值的信息
function isImportantDevMessage(msg: string): boolean {
  // 匹配构建时间、HMR更新等重要信息...
}
```

### 兼容性

- ✅ Vite 3.0+
- ✅ Node.js 16+
- ✅ TypeScript 完整支持
- ✅ Windows / macOS / Linux
- ✅ 支持 pnpm / yarn / npm

## 🔧 开发调试

### 插件只在开发模式生效

```typescript
export default function viteConsolePlugin(): Plugin {
  return {
    name: "vite-console-plugin",
    apply: "serve", // 只在 vite dev 时生效
    // ...
  }
}
```

### 禁用清屏功能

插件会自动设置 `clearScreen: false` 以保持输出的连续性。

## 📝 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✨ 支持精美的启动界面显示
- 🔧 自动获取项目和Git信息
- 🚫 智能屏蔽原生杂乱输出
- 🎨 完整的颜色和图标系统
- ⚡ 配置重载友好提示

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**CHENY** - [@ycyplus](https://github.com/ycyplus)

---

<div align="center">
  <p>如果这个插件对你有帮助，请给个 ⭐️ 支持一下！</p>
  <p>Made with ❤️ by CHENY</p>
</div>