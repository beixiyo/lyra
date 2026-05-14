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

  getDefaultMusicDir: async () => {
    const { homedir } = await import('node:os')
    const { existsSync } = await import('node:fs')
    const { join } = await import('node:path')

    const home = homedir()

    const xdgMusic = Bun.env.XDG_MUSIC_DIR
    if (xdgMusic && existsSync(xdgMusic)) return xdgMusic

    const musicDir = join(home, 'Music')
    if (existsSync(musicDir)) return musicDir

    return ''
  },

  pickMusicDirs: async () => {
    const { homedir } = await import('node:os')
    const { Utils } = await (import('electrobun/bun') as Promise<any>)
    return await Utils.openFileDialog({
      startingFolder: homedir(),
      canChooseFiles: false,
      canChooseDirectory: true,
      allowsMultipleSelection: true,
    }) as string[]
  },
}

export const bunMessages = {
  log: ({ msg }: { msg: string }) => {
    console.log('[WebView]', msg)
  },
}
