/** ANSI 转义码（基础 16 色 + 明亮色，所有终端均支持，不依赖真彩色） */
export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  brightWhite: "\x1b[97m",
  gray: "\x1b[90m",
} as const;
