const ANSI_RE = /\x1b\[[0-9;]*m/g;

// Vite 原生启动噪音：地址行 / Network 提示 / 快捷键帮助 / DevTools 与 UnoCSS 提示
// 锚定行首的走合并正则一次扫描；DevTools 类多行输出含固定路径标记，用子串匹配兜底
const BLOCK_SOURCES = [
  "^➜\\s+Local:",
  "^➜\\s+Network:",
  "^➜\\s+press\\s+h\\s*\\+\\s*enter",
  "^➜\\s+Vue\\s+DevTools",
  "^➜\\s+UnoCSS\\s+Inspector",
  "^Local:\\s+http",
  "^Network:\\s+use\\s+--host",
  "^press\\s+h\\s*\\+\\s+enter",
  "as\\s+a\\s+separate\\s+window",
  "to\\s+toggle\\s+the\\s+Vue\\s+DevTools",
  "__devtools__",
  "__unocss",
];

export type BlockPattern = string | RegExp;

/**
 * 构造消息过滤器：所有默认规则合并为单条正则，一条日志只做一次扫描；
 * 用户传入的 RegExp 保留自身 flags 逐条测试（通常为零）。
 */
export function createMessageFilter(extra: BlockPattern[] = []): (msg: string) => boolean {
  const sources = [...BLOCK_SOURCES];
  const extraRegexps: RegExp[] = [];
  for (const pattern of extra) {
    if (typeof pattern === "string") sources.push(pattern);
    else extraRegexps.push(pattern);
  }
  const combined = new RegExp(sources.join("|"));

  return (msg: string) => {
    const clean = msg.replace(ANSI_RE, "").trim();
    if (combined.test(clean)) return true;
    for (const re of extraRegexps) {
      if (re.test(clean)) return true;
    }
    return false;
  };
}
