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

- 🎛️ **单条结构化启动面板** —— 服务器信息 / 项目信息 / 团队与提醒，分区呈现、中英混排严格对齐
- 🔇 **原生噪音过滤** —— 屏蔽 Vite 的 Local / Network / 快捷键 / DevTools / UnoCSS 提示行，支持 `blockPatterns` 追加自定义规则
- 🌿 **Git 状态感知** —— 分支、短哈希，与远程的领先 / 落后 / 分叉状态，非 main 分支附与 `main` 的对比
- 📦 **零配置可用** —— `systemName` 留空自动读项目 `package.json` 的 `name`，版本号同样自动读取
- ⚡ **零性能负担** —— 屏蔽规则合并为单条正则（单次判定约 36ns）；console 拦截仅存在于启动窗口期，之后完全还原；git 信息异步预取、不阻塞启动
- 🛠️ **仅开发阶段生效** —— `apply: 'serve'`，`build` 产物零影响、零运行时依赖
- 🔁 **配置重载提示** —— vite 配置热重启时给出轻量提示，面板不会重复刷屏

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
  plugins: [viteConsolePlugin()],
})
```

零配置即可工作：面板标题自动取项目 `package.json` 的 `name`，版本号自动读取，Git 状态自动探测。

要展示团队与提醒信息，传入对应字段：

```typescript
export default defineConfig({
  plugins: [
    viteConsolePlugin({
      systemName: 'Robot_Admin',           // 留空则自动读 package.json 的 name
      description: '后台管理系统',           // 留空隐藏
      team: 'AGILE|TEAM',                  // 留空隐藏
      owner: 'CHENY',                      // 留空隐藏
      warning: '请勿随意修改配置文件',        // 留空隐藏
      security: '禁止部署未加密的敏感数据',   // 留空隐藏
      devtools: 'Vue DevTools',            // 留空隐藏
      blockPatterns: [/^\[my-plugin\]/],  // 追加自定义屏蔽规则（可选）
    }),
  ],
})
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `systemName` | `string` | `''` | 面板标题；留空自动读取 `package.json` 的 `name` |
| `description` | `string` | `''` | 系统描述，显示在标题旁；留空隐藏 |
| `team` | `string` | `''` | 团队名称；留空隐藏 |
| `owner` | `string` | `''` | 项目负责人；留空隐藏 |
| `warning` | `string` | `''` | 协作提醒（黄色）；留空隐藏 |
| `security` | `string` | `''` | 安全提醒（红色）；留空隐藏 |
| `autoVersion` | `boolean` | `true` | 是否自动读取并显示版本号 |
| `devtools` | `string` | `''` | 开发工具提示（如 DevTools 说明）；留空隐藏 |
| `blockPatterns` | `(string \| RegExp)[]` | `[]` | 追加的自定义屏蔽规则；字符串按正则源码解析，`RegExp` 保留 flags |

## 输出效果

```
────────────────────────────────────────────────────
  ▍Robot_Admin · 后台管理系统
────────────────────────────────────────────────────
  本地访问  http://localhost:5173/
  网络访问  http://192.168.1.100:5173/
  开发工具  Vue DevTools

  版本号    v1.2.3
  Git       main · a1b2c3d · ✓ 与远程同步
  启动时间  2026-10-21 10:30:45
────────────────────────────────────────────────────
  架构组    AGILE|TEAM
  负责人    CHENY

  提醒      请勿随意修改配置文件
            禁止部署未加密的敏感数据
────────────────────────────────────────────────────
```

未启用的信息自动隐藏（如未配置团队则不渲染该区块；未开 `server.host` 时网络访问显示灰色提示）。

**Git 状态**的取值：

| 显示 | 含义 |
|------|------|
| `main · a1b2c3d · ✓ 与远程同步` | 与上游分支完全一致 |
| `main · a1b2c3d · ↑ 领先远程 2 个提交` | 本地领先远程 |
| `main · a1b2c3d · ↓ 落后远程 3 个提交` | 本地落后远程 |
| `feat/x · a1b2c3d · ↕ 与远程分叉 ↑1 ↓2` | 双方均有新提交 |
| `feat/x · a1b2c3d · ○ 本地分支（无上游）` | 远程不存在同名分支 |
| `HEAD (detached)` | 分离头指针状态 |
| `✗ git 不可用` | 非 git 仓库或 git 不可用 |

非 `main` / `master` 分支还会追加与 `main` 的对比（如 `· 领先 main 3`、`· 落后 main 2`）。

## 工作原理

插件仅在 dev server 阶段（`apply: 'serve'`）生效：

1. **关闭清屏** —— 通过插件 `config` 钩子返回 `clearScreen: false`
2. **包装 Vite logger** —— `info` / `warn` 先过屏蔽规则再放行；`error` 原样输出；配置热重启（`server restarted`）时追加一行轻量提示
3. **启动窗口期兜底 console** —— 部分插件直接用 `console.log` 打印提示，插件在启动窗口期（`configResolved` 起，banner 后约 1.2s 止，最长 8s）临时包装 `console` 的 `log` / `info` / `warn`，窗口结束**完全还原**，稳态零开销
4. **Git 信息异步预取** —— `configResolved` 即并发执行 `git status -sb` 与 `git rev-parse --short HEAD`（以 vite root 为工作目录），banner 打印时通常已就绪；单命令 1.5s 超时兜底，永不阻塞事件循环

**屏蔽的输出**（Vite 原生启动噪音）：

- `➜ Local: ...` / `➜ Network: use --host to expose`
- `➜ press h + enter to show help`
- Vue DevTools / UnoCSS Inspector 的地址与快捷键提示（含 `__devtools__` / `__unocss` 路径）

**保留的输出**（真正影响开发的信号）：

- `VITE vx.x.x ready in Nms` / `built in Nms`
- `hmr update` / `page reload`
- `N modules transformed`
- `optimizing dependencies` / `dependencies optimized`
- 所有 error 与 warn

### 性能设计

| 环节 | 开销 |
|------|------|
| 消息过滤 | 所有规则合并为单条正则、只检查首参，单次判定约 **36ns**（实测比逐条规则快一个数量级） |
| console 包装 | 仅存在于启动窗口期（约 2.5s），之后还原为原生函数，稳态**零开销** |
| git 探测 | 每进程最多 4 次异步子进程（并发执行、带超时），不阻塞启动；banner 最多等待 300ms |
| 构建 | `apply: 'serve'`，`vite build` 完全不加载本插件，产物零运行时依赖 |

## FAQ

<details>
<summary><b>为什么「网络访问」显示灰色提示？</b></summary>

未开启 `server.host` 时 Vite 不监听局域网地址。在 `vite.config.ts` 中设置 `server: { host: true }` 后，面板会显示局域网访问地址。

</details>

<details>
<summary><b>monorepo 里版本号 / git 读取的是哪个目录？</b></summary>

均以 Vite `root`（启动配置的项目根）为准：版本读 `root/package.json`，git 命令以 `root` 为工作目录执行。无论从 monorepo 根还是子包启动都符合预期。

</details>

<details>
<summary><b>修改配置触发重启后，为什么不再次打印面板？</b></summary>

设计如此：面板每个进程只完整输出一次，重启后只会看到 `server restarted` 与一行轻量提示，避免刷屏。

</details>

<details>
<summary><b>屏蔽规则可以自定义吗？</b></summary>

可以。传入 `blockPatterns` 追加规则，字符串按正则源码解析（如 `'^\\[vite-plugin-x\\]'`），`RegExp` 对象保留自身 flags：

```typescript
viteConsolePlugin({ blockPatterns: [/^\[my-plugin\]/, '^\\[noise\\]'] })
```

</details>

<details>
<summary><b>会影响启动速度或开发期性能吗？</b></summary>

不会。git 信息在配置解析阶段异步预取，banner 打印最多等待 300ms（超时降级为「git 不可用」）；消息过滤为单次正则判定（纳秒级）；console 包装在启动窗口后完全还原——日常 HMR 与应用日志走的是原生函数。

</details>

<details>
<summary><b>会影响生产构建吗？</b></summary>

不会。插件 `apply: 'serve'`，仅 dev server 阶段注册；`vite build` 完全不经过本插件。

</details>

## 兼容性

| 项目 | 要求 |
|------|------|
| Vite | `>= 4.0.0`（peer dependency，4 ~ 8 实测可用） |
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
