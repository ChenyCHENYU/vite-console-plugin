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

const WIDTH = 52;
const LABEL_WIDTH = 10;

const rule = `${colors.gray}${"─".repeat(WIDTH)}${colors.reset}`;

const row = (label: string, value: string) =>
  `  ${colors.gray}${padEndDisplay(label, LABEL_WIDTH)}${colors.reset}${value}`;

const continuation = (value: string) =>
  `  ${" ".repeat(LABEL_WIDTH)}${value}`;

function gitStatusText(git: GitInfo): string {
  if (git.offline) return `${colors.gray}✗ git 不可用${colors.reset}`;
  if (git.branch === "HEAD (detached)")
    return `${colors.gray}○ 分离头指针${colors.reset}`;
  if (!git.upstream)
    return `${colors.gray}○ 本地分支（无上游）${colors.reset}`;

  const { ahead, behind } = git.upstream;
  let status: string;
  if (ahead > 0 && behind > 0)
    status = `${colors.yellow}↕ 与远程分叉 ↑${ahead} ↓${behind}${colors.reset}`;
  else if (ahead > 0)
    status = `${colors.yellow}↑ 领先远程 ${ahead} 个提交${colors.reset}`;
  else if (behind > 0)
    status = `${colors.yellow}↓ 落后远程 ${behind} 个提交${colors.reset}`;
  else status = `${colors.green}✓ 与远程同步${colors.reset}`;

  if (git.vsMain) {
    const { ahead: mAhead, behind: mBehind } = git.vsMain;
    if (mAhead > 0 && mBehind > 0)
      status += `${colors.gray} · 与 main 分叉 ↑${mAhead} ↓${mBehind}${colors.reset}`;
    else if (mAhead > 0)
      status += `${colors.gray} · 领先 main ${mAhead}${colors.reset}`;
    else if (mBehind > 0)
      status += `${colors.gray} · 落后 main ${mBehind}${colors.reset}`;
  }
  return status;
}

export function renderBanner(data: BannerData): string {
  const lines: string[] = [];

  lines.push(rule);
  lines.push(
    `  ${colors.cyan}${colors.bold}▍${colors.reset}${colors.brightWhite}${colors.bold}${data.systemName}${colors.reset}` +
      (data.description
        ? `${colors.gray} · ${data.description}${colors.reset}`
        : "")
  );
  lines.push(rule);

  lines.push(row("本地访问", `${colors.brightCyan}${data.localUrl}${colors.reset}`));
  lines.push(
    data.networkUrl
      ? row("网络访问", `${colors.brightCyan}${data.networkUrl}${colors.reset}`)
      : row("网络访问", `${colors.gray}未启用 · 需 server.host${colors.reset}`)
  );
  if (data.devtools)
    lines.push(row("开发工具", `${colors.magenta}${data.devtools}${colors.reset}`));

  lines.push("");
  if (data.version)
    lines.push(row("版本号", `${colors.green}v${data.version}${colors.reset}`));
  lines.push(
    row(
      "Git",
      data.git.offline
        ? gitStatusText(data.git)
        : `${colors.magenta}${data.git.branch}${colors.reset}${colors.gray} · ${colors.reset}` +
          `${colors.yellow}${data.git.commit}${colors.reset}${colors.gray} · ${colors.reset}` +
          gitStatusText(data.git)
    )
  );
  lines.push(row("启动时间", `${colors.brightWhite}${data.startTime}${colors.reset}`));

  if (data.team || data.owner || data.warning || data.security) {
    lines.push(rule);
    if (data.team) lines.push(row("架构组", `${colors.brightWhite}${data.team}${colors.reset}`));
    if (data.owner) lines.push(row("负责人", `${colors.brightWhite}${data.owner}${colors.reset}`));
    if ((data.team || data.owner) && (data.warning || data.security)) lines.push("");
    if (data.warning)
      lines.push(row("提醒", `${colors.yellow}${data.warning}${colors.reset}`));
    if (data.security)
      lines.push(
        data.warning
          ? continuation(`${colors.red}${data.security}${colors.reset}`)
          : row("提醒", `${colors.red}${data.security}${colors.reset}`)
      );
  }

  lines.push(rule);
  return lines.join("\n");
}
