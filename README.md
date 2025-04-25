# vite-console-plugin

一个用于 Vite 启动时在控制台输出美化信息和团队警告的插件，支持自定义系统名称、版
本、团队、负责人、协作警告和安全警告等内容。

## 特性

- 启动时在控制台输出系统信息和团队警告
- 配置变更时输出高亮提示
- 支持自定义输出内容
- 避免多实例重复输出

## 安装

```bash
npm install vite-console-plugin --save-dev

```

## 使用

在你的 `vite.config.ts` 中引入并配置插件：

```ts
import viteConsolePlugin from 'vite-console-plugin'

export default {
  plugins: [
    viteConsolePlugin({
      systemName: 'Robot_Admin 后台管理系统',
      version: '1.0.0',
      team: 'AGILE|TEAM',
      owner: 'CHENY',
      warning: '请勿随意修改配置文件',
      security: '禁止部署未加密的敏感数据',
    }),
  ],
}
```

## 配置项

所有配置项均为可选，未填写时将使用默认值。

| 参数       | 类型   | 说明        | 默认值                   |
| ---------- | ------ | ----------- | ------------------------ |
| systemName | string | 系统名称    | Robot_Admin              |
| version    | string | 版本号      | 1.0.0                    |
| team       | string | 团队/架构组 | AGILE\|TEAM              |
| owner      | string | 负责人      | CHENY                    |
| warning    | string | 协作警告    | 请勿随意修改配置文件     |
| security   | string | 安全警告    | 禁止部署未加密的敏感数据 |

## 效果示例

启动 Vite 服务时，控制台会输出如下内容：

═══════════════════════════════════════     
 ➜ 系统名称: Robot_Admin 后台管理系统  
 ➜ 版本号: 1.0.0  
 ➜ 架构组: AGILE|TEAM  
 ➜ 负责人: CHENY  
 ➜ 协作警告: 请勿随意修改配置文件  
 ➜ 安全警告: 禁止部署未加密的敏感数据  
═══════════════════════════════════════
