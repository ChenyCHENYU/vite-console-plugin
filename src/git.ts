import { execFile } from "child_process";

export interface GitSyncState {
  ahead: number;
  behind: number;
}

export interface GitInfo {
  offline: boolean;
  branch: string;
  commit: string;
  /** 与上游（origin/同名分支）的关系；null 表示无上游或处于分离头指针 */
  upstream: GitSyncState | null;
  /** 非 main/master 分支时与 origin/main（或 origin/master）的关系 */
  vsMain: GitSyncState | null;
}

/** git 不可用 / 非 git 仓库时的兜底信息 */
export const GIT_UNAVAILABLE: GitInfo = {
  offline: true,
  branch: "unknown",
  commit: "unknown",
  upstream: null,
  vsMain: null,
};

const GIT_TIMEOUT_MS = 1500;

const run = (args: string[], cwd: string): Promise<string | null> =>
  new Promise((resolve) => {
    execFile(
      "git",
      args,
      { cwd, timeout: GIT_TIMEOUT_MS, encoding: "utf8", windowsHide: true },
      (err, stdout) => resolve(err ? null : stdout)
    );
  });

function parseStatusLine(line: string): Pick<GitInfo, "branch" | "upstream"> | null {
  // 形如：## main...origin/main [ahead 2, behind 1] / ## main...origin/main / ## feat-x
  if (/^## HEAD \(no branch\)/.test(line))
    return { branch: "HEAD (detached)", upstream: null };

  const m =
    /^## (\S+?)(?:\.\.\.(\S+?)(?:\s+\[ahead (\d+)(?:, behind (\d+))?\]|\s+\[behind (\d+)\])?)?$/.exec(
      line
    );
  if (!m) return null;

  return {
    branch: m[1],
    upstream: m[2]
      ? {
          ahead: Number(m[3] ?? 0),
          behind: Number(m[4] ?? m[5] ?? 0),
        }
      : null,
  };
}

async function diffVsMain(branch: string, cwd: string): Promise<GitSyncState | null> {
  if (branch === "main" || branch === "master") return null;
  for (const mainRef of ["origin/main", "origin/master"]) {
    const out = await run(["rev-list", "--left-right", "--count", `HEAD...${mainRef}`], cwd);
    if (out) {
      const [ahead, behind] = out.trim().split(/\s+/).map(Number);
      if (!Number.isNaN(ahead) && !Number.isNaN(behind)) return { ahead, behind };
    }
  }
  return null;
}

/** 全部走异步子进程并并发执行，不阻塞事件循环；单命令 1.5s 超时兜底 */
export async function collectGitInfo(cwd: string): Promise<GitInfo> {
  const [statusOut, commitOut] = await Promise.all([
    run(["status", "-sb"], cwd),
    run(["rev-parse", "--short", "HEAD"], cwd),
  ]);

  const firstLine = (statusOut ?? "").split("\n", 1)[0];
  const parsed = firstLine ? parseStatusLine(firstLine) : null;
  if (!parsed || !commitOut) return GIT_UNAVAILABLE;

  const branch = parsed.branch;
  const vsMain = await diffVsMain(branch, cwd);

  return {
    offline: false,
    branch,
    commit: commitOut.trim(),
    upstream: parsed.upstream,
    vsMain,
  };
}
