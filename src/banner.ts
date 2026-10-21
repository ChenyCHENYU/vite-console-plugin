import { colors } from "./colors";
import { padEndDisplay } from "./width";
import type { GitInfo } from "./git";

export interface BannerData {
  systemName: string;
  description: string;
  localUrl: string;
  networkUrl: string | null;
  devtools: string;
  version: string | null;
  git: GitInfo;
  startTime: string;
  team: string;
  owner: string;
  warning: string;
  security: string;
}

const RULE = `${colors.gray}${"─".repeat(50)}${colors.reset}`;
const LABEL_WIDTH = 12;

const section = (title: string) =>
  `${colors.white}${colors.bright}${title}${colors.reset}`;

const item = (bulletColor: string, label: string, value: string) =>
  `   ${bulletColor}●${colors.reset} ${colors.white}${padEndDisplay(label, LABEL_WIDTH)}${colors.reset}${value}`;

const plainItem = (color: string, text: string) =>
  `   ${color}●${colors.reset} ${color}${text}${colors.reset}`;

function branchStatusText(git: GitInfo): string {
  if (git.offline) return `unknown (离线状态 📱)`;

  const parts: string[] = [];
  if (git.upstream) {
    const { ahead, behind } = git.upstream;
    if (behind === 0 && ahead === 0) parts.push("与远程同步 ✅");
    else if (behind > 0 && ahead === 0) parts.push(`落后远程 ${behind} 个提交 🔄`);
    else if (ahead > 0 && behind === 0) parts.push(`领先远程 ${ahead} 个提交 ⬆️`);
    else parts.push("分叉状态 🔀");
  } else {
    parts.push("本地分支 📱");
  }

  if (git.vsMain) {
    const { ahead, behind } = git.vsMain;
    if (ahead === 0 && behind === 0) {
      parts.push("基于 main 最新代码 ✅");
    } else if (ahead > 0) {
      let text = `领先 main ${ahead} 个提交 ⬆️`;
      if (behind > 0) text += ` (main 领先 ${behind} 个提交) 🔄`;
      parts.push(text);
    } else if (behind > 0) {
      parts.push(`main 领先 ${behind} 个提交 🔄`);
    }
  }

  return `${git.branch} (${parts.join(" | ")})`;
}

export function renderBanner(data: BannerData): string {
  const lines: string[] = [];

  lines.push(RULE);
  lines.push(
    `${colors.cyan}${colors.bright}🤖 ${data.systemName}${colors.reset}` +
      (data.description ? ` ${colors.gray}${data.description}${colors.reset}` : "")
  );
  lines.push("");

  lines.push(section("⚡ 服务器信息"));
  lines.push(
    item(colors.green, "本地访问", `${colors.green}${colors.bright}${data.localUrl}${colors.reset}`)
  );
  lines.push(
    data.networkUrl
      ? item(colors.blue, "网络访问", `${colors.blue}${data.networkUrl}${colors.reset}`)
      : item(colors.gray, "网络访问", `${colors.gray}需要 --host 参数启用${colors.reset}`)
  );
  if (data.devtools)
    lines.push(item(colors.magenta, "开发工具", `${colors.magenta}${data.devtools}${colors.reset}`));
  lines.push("");

  lines.push(section("📦 项目信息"));
  if (data.version)
    lines.push(
      item(colors.green, "版本号", `${colors.green}${colors.bright}v${data.version}${colors.reset}`)
    );
  lines.push(item(colors.blue, "启动时间", `${colors.blue}${data.startTime}${colors.reset}`));
  lines.push(
    item(colors.magenta, "Git 分支", `${colors.magenta}${branchStatusText(data.git)}${colors.reset}`)
  );
  lines.push(
    item(colors.yellow, "提交哈希", `${colors.yellow}${data.git.commit}${colors.reset}`)
  );
  lines.push("");

  if (data.team || data.owner) {
    lines.push(section("👥 团队信息"));
    if (data.team) lines.push(item(colors.blue, "架构组", `${colors.blue}${data.team}${colors.reset}`));
    if (data.owner) lines.push(item(colors.blue, "负责人", `${colors.blue}${data.owner}${colors.reset}`));
    lines.push("");
  }

  if (data.warning || data.security) {
    lines.push(section("⚠️  重要提醒"));
    if (data.warning) lines.push(plainItem(colors.yellow, data.warning));
    if (data.security) lines.push(plainItem(colors.red, data.security));
    lines.push("");
  }

  lines.push(
    `${colors.green}${colors.bright}✨ 启动成功！${colors.reset} ${colors.gray}开发服务器已就绪${colors.reset}`
  );
  lines.push(RULE);

  return lines.join("\n");
}
