const WIDE_RE =
  /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/;

/** 终端显示宽度（CJK / 全角按 2 列计） */
export function displayWidth(text: string): number {
  let width = 0;
  for (const ch of text) width += WIDE_RE.test(ch) ? 2 : 1;
  return width;
}

/** 按显示宽度右侧补空格，保证中英混排标签对齐 */
export function padEndDisplay(text: string, width: number): string {
  return text + " ".repeat(Math.max(0, width - displayWidth(text)));
}
