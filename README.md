<div align="center">

<img src="./docs/assets/banner.svg" alt="vite-console-plugin" width="100%" />

**更干净的 Vite 启动台** —— 用一条结构化启动面板替换原生启动噪音

[![npm version](https://img.shields.io/npm/v/vite-console-plugin?style=flat-square&color=818CF8&labelColor=0B1020)](https://www.npmjs.com/package/vite-console-plugin)
[![npm downloads](https://img.shields.io/npm/dm/vite-console-plugin?style=flat-square&color=22D3EE&labelColor=0B1020)](https://www.npmjs.com/package/vite-console-plugin)
[![License](https://img.shields.io/badge/License-MIT-C084FC?style=flat-square&labelColor=0B1020)](./LICENSE)
[![Vite](https://img.shields.io/badge/Vite-%E2%89%A5%204-646CFF?style=flat-square&labelColor=0B1020&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/Node-%E2%89%A5%2018-5FA04E?style=flat-square&labelColor=0B1020&logo=node.js&logoColor=white)](https://nodejs.org/)

[安装](#安装) · [快速开始](#快速开始) · [配置选项](#配置选项) · [输出效果](#输出效果) · [工作原理](#工作原理) · [FAQ](#faq)

</div>

## 它解决什么问题

Vite 启动时会输出 `Local` / `Network` / `press h + enter` / 各类 DevTools 提示等一堆零散行，框架插件再追加自己的提示，真正需要的信息反而被淹没。

本插件在 **dev server 启动时**把这些原生噪音屏蔽掉，替换为一条结构化面板：访问地址、应用版本、Git 分支与同步状态、团队与安全提示；同时完整保留 HMR 更新、构建耗时、依赖优化、错误与警告等关键信息。

## 特性

- 🎛️ **单条结构化启动面板** —— 服务器信息 / 项目信息 / 团队信息 / 重要提醒，分区呈现
- 🔇 **原生噪音过滤** —— 屏蔽 Vite 的 Local / Network / 快捷键 / DevTools / UnoCSS 等提示行
- 🌿 **Git 状态感知** —— 当前分支、短哈希，以及与远程分支、与 `main` 的领先 / 落后 / 分叉状态
- 📦 **自动版本读取** —— 读取 Vite `root` 下 `package.json` 的版本号，monorepo 场景准确生效
- 🛠️ **仅开发阶段生效** —— `apply: 'serve'`，`build` 产物零影响、零运行时依赖
- 🧩 **TypeScript 开箱支持** —— 类型随包发布，ESM / CJS 双格式

## 安装

```bash
pnpm add vite-console-plugin -D
# 或
npm install vite-console-plugin --save-dev
# 或
yarn add vite-console-plugin -D
# 或
bun add vite-console-plugin -d
```

## 快速开始

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import viteConsolePlugin from 'vite-console-plugin'

export default defineConfig({
  plugins: [
    viteConsolePlugin({
      systemName: 'My App',
      description: '业务管理平台',
      owner: 'Your Name',
    }),
  ],
})
```

启动 `vite`，原生启动信息即被替换为结构化面板（完整效果见[输出效果](#输出效果)）。

### 完整配置示例

```typescript
import { defineConfig } from 'vite'
import viteConsolePlugin from 'vite-console-plugin'

export default defineConfig({
  plugins: [
    viteConsolePlugin({
      systemName: 'Robot_Admin',          // 系统名称
      description: '后台管理系统',         // 系统描述
      team: 'AGILE|TEAM',                 // 团队名称
      owner: 'CHENY',                     // 负责人
      warning: '请勿随意修改配置文件',      // 协作警告（留空隐藏）
      security: '禁止部署未加密的敏感数据', // 安全警告（留空隐藏）
      autoVersion: true,                  // 自动读取 package.json 版本
      devtools: 'Vue DevTools & UnoCSS Inspector', // 开发工具提示（留空隐藏）
    }),
  ],
})
```

> 💡 所有字段均有默认值，但默认值偏内部团队风格，建议在项目里**显式配置** `systemName` / `description` / `owner` 等字段，输出才是你自己的信息。

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `systemName` | `string` | `'Robot_Admin'` | 面板标题中的系统名称 |
| `description` | `string` | `'后台管理系统'` | 系统描述，显示在标题旁 |
| `team` | `string` | `'AGILE\|TEAM'` | 团队名称，留空隐藏该行 |
| `owner` | `string` | `'CHENY'` | 项目负责人，留空隐藏该行 |
| `warning` | `string` | `'请勿随意修改配置文件'` | 协作警告，留空隐藏该行 |
| `security` | `string` | `'禁止部署未加密的敏感数据'` | 安全警告，留空隐藏该行 |
| `autoVersion` | `boolean` | `true` | 是否自动读取 `package.json` 版本号 |
| `devtools` | `string` | `''` | 开发工具提示（如 DevTools 地址），留空隐藏 |

## 输出效果

```
──────────────────────────────────────────────────

🤖 Robot_Admin 后台管理系统

⚡ 服务器信息
   ● 本地访问   http://localhost:5173/
   ● 网络访问   http://192.168.1.100:5173/
   ● 开发工具   Vue DevTools & UnoCSS Inspector

📦 项目信息
   ● 版本号      v1.2.3
   ● 启动时间    2026-10-21 10:30:45
   ● Git 分支    main (与远程同步 ✅)
   ● 提交哈希    a1b2c3d

👥 团队信息
   ● 架构组      AGILE|TEAM
   ● 负责人      CHENY

⚠️  重要提醒
   ● 请勿随意修改配置文件
   ● 禁止部署未加密的敏感数据

✨ 启动成功！ 开发服务器已就绪
──────────────────────────────────────────────────
```

**Git 分支状态**的取值：

| 显示 | 含义 |
|------|------|
| `main (与远程同步 ✅)` | 与 `origin/main` 完全一致 |
| `main (落后远程 3 个提交 🔄)` | 本地落后远程分支 |
| `main (领先远程 2 个提交 ⬆️)` | 本地领先远程分支 |
| `feature/x (分叉状态 🔀)` | 本地与远程均有新提交 |
| `feature/x (本地分支 📱)` | 远程不存在同名分支 |
| `main (离线状态 📱)` | git 不可用或非 git 仓库 |

在非 `main` / `master` 分支上，还会追加与 `main` 的对比信息（如 `基于 main 最新代码 ✅`、`领先 main N 个提交`）。

## 工作原理

插件仅在 dev server 阶段（`apply: 'serve'`）生效：

1. **关闭清屏** —— 设置 `clearScreen: false`，保住面板不被后续输出冲掉
2. **包装 Vite logger** —— `info` / `warn` 输出先经过滤规则再放行；`error` 原样输出
3. **包装 Node `console`** —— `info` / `log` / `warn` 同样经过滤规则；dev server 关闭时自动还原

**屏蔽的输出**（Vite 原生启动噪音）：

- `➜ Local: ...` / `➜ Network: use --host to expose`
- `➜ press h + enter to show help`
- Vue DevTools / UnoCSS Inspector 的地址与快捷键提示

**保留的输出**（真正影响开发的信号）：

- `ready in Xms` / `built in Xms`
- `hmr update` / `page reload`
- `N modules transformed`
- `optimizing dependencies` / `dependencies optimized`
- 所有 error 与 warn

> ⚠️ **注意**：对 `console` 的包装作用于整个 Node 进程。如果业务代码里恰好输出了与屏蔽规则匹配的文本（如 `Local: http://...`），同样会被过滤——请避免在应用日志中使用这类前缀。

## FAQ

<details>
<summary><b>为什么「网络访问」显示灰色提示？</b></summary>

未开启 `server.host` 时 Vite 不监听局域网地址。在 `vite.config.ts` 中设置 `server: { host: true }` 后，面板会显示局域网访问地址。

</details>

<details>
<summary><b>monorepo 里版本号读取的是哪个 package.json？</b></summary>

读取 Vite `root`（启动目录）下的 `package.json`。子包内启动 dev server 时即读子包版本，符合预期。

</details>

<details>
<summary><b>修改配置触发重启后，为什么不再次打印面板？</b></summary>

设计如此：面板每个进程只完整输出一次，重启后只会看到 `server restarted` 等常规信息，避免刷屏。

</details>

<details>
<summary><b>屏蔽规则可以自定义吗？</b></summary>

当前版本内置规则、不开放配置。如有需要欢迎提 [Issue](https://github.com/ChenyCHENYU/vite-console-plugin/issues)。

</details>

<details>
<summary><b>会影响生产构建吗？</b></summary>

不会。插件 `apply: 'serve'`，仅 dev server 阶段注册；`vite build` 完全不经过本插件，产物无任何运行时依赖。

</details>

## 兼容性

| 项目 | 要求 |
|------|------|
| Vite | `>= 4.0.0`（peer dependency，4 / 5 / 6 / 7 均可） |
| Node.js | `>= 18` |
| 模块格式 | ESM / CJS 双格式，TypeScript 类型内置 |
| 平台 | macOS / Windows / Linux |

## 版本历史

见 [GitHub Releases](https://github.com/ChenyCHENYU/vite-console-plugin/releases) 与 [提交记录](https://github.com/ChenyCHENYU/vite-console-plugin/commits/main)。

## 贡献

欢迎提交 [Issue](https://github.com/ChenyCHENYU/vite-console-plugin/issues) 与 Pull Request。

## 许可证

[MIT](./LICENSE) © 2025-present CHENY

## 作者

**CHENY** · [GitHub @ChenyCHENYU](https://github.com/ChenyCHENYU)

---

<div align="center">
  <sub>如果这个插件对你有帮助，欢迎点一个 ⭐ 让更多人看到。</sub>
</div>
