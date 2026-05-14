/**
 * Bun 端 RPC handler 实现
 *
 * 只需在这里写一次，WebView 端通过 `typeof` 自动推导类型
 * 新增命令只需：1. 加 handler  2. 完成（无需手动同步类型）
 */

export const bunRequests = {
  readFile: async ({ path }: { path: string }) => {
    return await Bun.file(path).text()
  },

  getAppVersion: () => {
    return '0.1.0'
  },

  scanMusicDir: async ({ dir }: { dir: string }) => {
    const { scanAndParse } = await import('../music/scanner')
    return await scanAndParse(dir)
  },
}

export const bunMessages = {
  log: ({ msg }: { msg: string }) => {
    console.log('[WebView]', msg)
  },
}
