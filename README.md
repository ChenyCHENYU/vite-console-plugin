# Vite Console Plugin

> 🚀 一个精美的 Vite 开发服务器启动信息插件，提供企业级的终端输出体验

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-green.svg)](https://vitejs.dev/)

## ✨ 特性

- 🎨 **精美的视觉效果** - 使用 Unicode 边框和丰富的颜色打造专业级启动界面
- 🔧 **智能信息整合** - 自动获取版本号、Git 信息、服务器地址等开发信息
- 🚫 **原生信息屏蔽** - 完全屏蔽 Vite 原生的杂乱输出，提供统一的视觉体验
- ⚡ **零配置使用** - 开箱即用，同时支持灵活的自定义配置
- 📦 **自动版本读取** - 自动从 `package.json` 读取最新版本信息
- 🌿 **Git 集成** - 显示当前分支和提交哈希，便于开发调试
- 🛡️ **团队协作** - 支持团队信息、警告提示等协作功能

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
      warning: '团队协作项目，修改前请先沟通',
      security: '生产环境禁止输出敏感信息',
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
╭─────────────────────────────────────────────────╮
│                                                 │
│  🚀 Robot_Admin 后台管理系统                     │
│                                                 │
├─────────────────────────────────────────────────┤
│  🌐 本地访问: http://localhost:3000/            │
│  📡 网络访问: http://192.168.1.100:3000/       │
│  🔧 Vue DevTools: 已启用                       │
│  🔍 UnoCSS Inspector: 已启用                   │
├─────────────────────────────────────────────────┤
│  📦 版本号: v1.2.3                              │
│  🕐 启动时间: 2025/08/01 10:30:45               │
│  🌿 分支: main                                  │
│  🔗 提交: a1b2c3d                               │
│  👥 架构组: AGILE|TEAM                          │
│  👨‍💻 负责人: CHENY                              │
├─────────────────────────────────────────────────┤
│  ⚠️ 协作警告: 团队协作项目，修改前请先沟通         │
│  🛡️ 安全警告: 生产环境禁止输出敏感信息           │
│                                                 │
╰─────────────────────────────────────────────────╯
```

### 配置重载提示

```
⚡ 配置重载 配置文件已更改，请验证修改项并告知相关干系人
```

## 🔍 功能详解

### 自动信息获取

插件会自动获取以下信息：

- **版本号**: 从 `package.json` 自动读取
- **Git 分支**: 当前工作分支
- **Git 提交**: 最新提交的短哈希
- **服务器地址**: 本地和网络访问地址
- **启动时间**: 系统启动的具体时间

### 原生信息屏蔽

完全屏蔽 Vite 原生的以下输出：
- `Local: http://localhost:xxxx/`
- `Network: use --host to expose`
- `Vue DevTools: Open http://...`
- `UnoCSS Inspector: http://...`
- `press h + enter to show help`

## 🎯 最佳实践

### 团队协作配置

```typescript
viteConsolePlugin({
  systemName: 'ProjectName',
  description: '项目描述',
  team: 'Frontend Team',
  owner: '项目负责人',
  warning: '修改配置前请通知团队成员',
  security: '注意保护敏感信息安全'
})
```

### 个人项目配置

```typescript
viteConsolePlugin({
  systemName: 'Personal Project',
  description: '个人项目',
  owner: 'Your Name',
  autoVersion: true
})
```

### 最小化配置

```typescript
viteConsolePlugin({
  systemName: 'My App'
})
```

## 🛠️ 技术实现

### 核心特性

- **信息拦截**: 通过重写 `server.config.logger.info` 实现原生信息屏蔽
- **状态管理**: 使用全局状态避免多实例重复输出
- **动态信息**: 实时读取文件系统和 Git 信息
- **颜色系统**: 完整的 ANSI 颜色支持
- **Unicode 绘图**: 使用 Unicode 字符绘制精美边框

### 兼容性

- ✅ Vite 3.0+
- ✅ Node.js 16+
- ✅ TypeScript 支持
- ✅ 所有主流操作系统

## 📝 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✨ 支持精美的启动界面
- 🔧 自动信息获取
- 🚫 原生信息屏蔽

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