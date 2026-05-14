import type { ElectrobunConfig } from 'electrobun'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

export default {
  app: {
    name: 'Electrobun Starter',
    identifier: 'electrobunstarter.electrobun.dev',
    version: pkg.version,
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: 'src/index.ts',
    },
    copy: {
      '../app/dist/index.html': 'views/mainview/index.html',
      '../app/dist/assets': 'views/mainview/assets',
    },
    watchIgnore: ['../app/dist/**'],
    mac: {
      bundleCEF: false,
      codesign: true,
      notarize: true,
    },
    linux: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
  release: {
    baseUrl: process.env.RELEASE_BASE_URL || '',
  },
} satisfies ElectrobunConfig
