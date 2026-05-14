import { $ } from 'bun'
import { platform } from 'os'
import { readdirSync } from 'fs'

const os = platform()

if (os === 'linux') {
  if (!process.env.DISPLAY && process.env.WAYLAND_DISPLAY) {
    try {
      const ps = await $`pgrep -a Xwayland`.text()
      const match = ps.match(/:(\d+)/)
      if (match) process.env.DISPLAY = `:${match[1]}`
    } catch {}
  }

  if (!process.env.XAUTHORITY) {
    const runtimeDir = process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid!()}`
    try {
      const xauth = readdirSync(runtimeDir).find(f => f.startsWith('xauth_'))
      if (xauth) process.env.XAUTHORITY = `${runtimeDir}/${xauth}`
    } catch {}
  }
}

// macOS / Windows: 无需处理，直接透传

const args = process.argv.slice(2)
const proc = Bun.spawn(args, {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env,
})
process.exitCode = await proc.exited
