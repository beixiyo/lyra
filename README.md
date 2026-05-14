# Electrobun Music

基于 **Electrobun + Bun + React + TailwindCSS** 的本地音乐播放器

全程 TypeScript，IPC 通信类型安全，Apple Music 风格 UI

## 系统依赖

| 依赖 | 说明 | 安装 |
|------|------|------|
| **Bun** | 运行时 & 包管理 | [bun.sh](https://bun.sh) |
| **GStreamer plugins** | WebKitGTK 音频解码（**Linux 必装**） | 见下方 |

### Linux（Arch / Manjaro）

```bash
sudo pacman -S gstreamer gst-plugins-base gst-plugins-good
```

### Linux（Ubuntu / Debian）

```bash
sudo apt install gstreamer1.0-plugins-base gstreamer1.0-plugins-good
```

> **缺少 GStreamer 插件会导致播放音乐时应用 crash（native segfault），不是代码 bug。**
> WebKitGTK 依赖 GStreamer 解码音频，没有对应格式的插件会在 C 层直接崩溃而非返回 JS 错误。

### macOS / Windows

系统自带音频解码，无需额外安装。

## 功能

- 递归扫描本地音乐目录（MP3 / FLAC / WAV / OGG / M4A / AAC / Opus / WMA / APE）
- 按文件夹自动分类（艺术家视图）
- 解析元数据：标题、艺术家、专辑、时长、歌词、编码格式
- 封面提取（按需加载，服务端缓存）
- 播放控制：播放 / 暂停 / 上一首 / 下一首 / 进度跳转 / 音量
- Apple Music 风格暗色 UI

## 项目结构

```
electrobun-starter/
├── packages/
│   ├── app/                    # React 前端（Vite + TailwindCSS 4）
│   │   ├── src/components/     # UI 组件（Sidebar / Player / TrackList / ArtistsGrid / CoverArt）
│   │   ├── src/stores/         # 状态管理（@preact/signals-react）
│   │   ├── src/ipc/            # WebView 端 RPC 客户端
│   │   └── src/types/          # 类型定义
│   ├── desktop/                # Electrobun 主进程（Bun）
│   │   ├── src/music/          # 音乐扫描 + 元数据解析 + HTTP 音频/封面服务
│   │   ├── src/rpc/            # RPC handlers
│   │   └── electrobun.config.ts
│   ├── utils/                  # 工具函数（cn / format / debounce / throttle / 类型守卫）
│   ├── hooks/                  # React Hooks
│   └── comps/                  # 组件库
├── scripts/
│   └── ensure-display.ts       # Wayland 显示环境自动检测
└── .github/workflows/
    └── release.yml             # GitHub Actions 自动打包发布
```

## 快速开始

```bash
bun install

# 启动桌面开发（Vite HMR + Electrobun 窗口）
bun run dev

# 仅启动 Web 开发（纯浏览器，不需要 Electrobun）
bun run dev:web
```

## 脚本说明

| 命令 | 说明 |
|------|------|
| `bun run dev` | 桌面开发：Vite HMR + Electrobun + 音频服务器 并行启动 |
| `bun run dev:web` | 仅 Web 开发（浏览器访问 `localhost:1420`，RPC 不可用） |
| `bun run dev:audio` | 单独启动音频服务器（`localhost:1421`） |
| `bun run build` | 生产构建（app + desktop） |
| `bun run build:canary` | 打包 canary 通道安装包 |
| `bun run build:stable` | 打包 stable 通道安装包 |
| `bun run build:app` | 仅构建 React app |
| `bun run build:libs` | 构建子包（utils → hooks → comps） |

## IPC / RPC 通信

Electrobun 使用类型安全的双向 RPC（Bun 主进程 ↔ WebView）

### 架构

```
┌─────────────────────────┐     RPC      ┌──────────────────────────┐
│  Bun 主进程 (desktop/)  │ ◄──────────► │  WebView (app/)          │
│                         │              │                          │
│  BrowserView.defineRPC  │  requests    │  Electroview.defineRPC   │
│  处理 bun.requests      │  messages    │  处理 webview.requests   │
└─────────────────────────┘              └──────────────────────────┘
```

- **requests**：异步请求，有返回值（类似函数调用）
- **messages**：单向消息，无返回值（类似事件）

### 类型自动推导

Handler 写一次，WebView 端通过 `typeof` 自动获得完整类型，**无需手动维护类型定义**：

```
handlers.ts (写一次)  →  typeof handlers  →  InferRequests<T>  →  WebView 自动获得类型
```

核心文件：

| 文件 | 作用 |
|------|------|
| `packages/desktop/src/rpc/handlers.ts` | Handler 实现（唯一真实来源） |
| `packages/app/src/ipc/core/types.ts` | `InferRequests` / `InferMessages` 推导工具类型 |
| `packages/app/src/ipc/client.ts` | WebView 端 RPC 客户端（类型自动推导） |

### 新增 RPC 命令

只需一步：在 `packages/desktop/src/rpc/handlers.ts` 加 handler，类型自动同步

```typescript
// packages/desktop/src/rpc/handlers.ts
export const bunRequests = {
  // ... 已有命令

  listFiles: async ({ dir }: { dir: string }) => {  // ← 加这里，完成
    const { readdirSync } = await import('fs')
    return readdirSync(dir) as string[]
  },
}
```

WebView 端立即可用，类型完整：

```typescript
import { rpc } from '@/ipc'

// rpc.request.listFiles 自动推导：
//   params: { dir: string }
//   response: string[]
const files = await rpc.request.listFiles({ dir: '/tmp' })
```

### 新增消息

同理，在 `handlers.ts` 的 `bunMessages` 加即可：

```typescript
export const bunMessages = {
  // ... 已有
  onProgress: ({ percent }: { percent: number }) => {
    console.log(`Progress: ${percent}%`)
  },
}
```

WebView 端发送（自动推导 payload 类型）：

```typescript
rpc.send.onProgress({ percent: 42 })
```

## 子包

### utils

| 导出 | 说明 |
|------|------|
| `cn()` | TailwindCSS class 合并（clsx + tailwind-merge） |
| `formatBytes` / `formatDuration` / `formatDate` | 格式化工具 |
| `debounce` / `throttle` | 防抖 / 节流 |
| `isString` / `isNumber` / `isObject` / ... | 类型守卫 |

### hooks

| 导出 | 说明 |
|------|------|
| `useLatestCallback` | 替代 useCallback，引用稳定 |
| `useGetState` | useState 增强，`setState.getLatest()` 获取最新值 |
| `onMounted` / `onUnmounted` | 生命周期简写 |
| `useDebounceFn` / `useThrottleFn` | 防抖 / 节流 hook |
| `useDebounceState` | 防抖 state |
| `useLocalStorage` | 持久化 useState |

### comps

| 导出 | 说明 |
|------|------|
| `Button` | 基础按钮组件（variant / size / className） |

## 打包发布

### 本地打包

```bash
# 开发构建（可直接运行，不生成安装包）
bun run build

# Canary 通道（测试）
bun run build:canary

# Stable 通道（正式发布）
bun run build:stable
```

产物输出到 `packages/desktop/artifacts/`：

```
artifacts/
├── *-Setup.tar.gz     # Linux 安装包
├── *.tar.zst          # 增量更新包
└── update.json        # 版本元数据
```

macOS 额外产出 `.dmg` / `.zip`

### GitHub Actions 自动发布

推送 tag 自动触发构建并创建 GitHub Release：

```bash
# 正式发布
git tag v0.1.0 && git push --tags

# Canary 测试
git tag v0.1.0-canary && git push --tags
```

macOS 签名需在 GitHub Secrets 配置：

| Secret | 说明 |
|--------|------|
| `ELECTROBUN_DEVELOPER_ID` | Apple Developer ID |
| `APPLE_ID` | Apple ID 邮箱 |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | Apple Team ID |

### 自动更新

在 `electrobun.config.ts` 中配置 `release.baseUrl`（或设置 `RELEASE_BASE_URL` 环境变量），指向托管产物的 URL。配置后 `build:canary` / `build:stable` 会自动生成增量补丁

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electrobun | latest | 桌面框架 |
| Bun | latest | 运行时 & 包管理 |
| React | 19 | UI |
| TypeScript | 6 | 语言 |
| Vite | 8（Rolldown） | 构建 |
| TailwindCSS | 4 | 样式 |
| @preact/signals-react | 3 | 状态管理 |
| music-metadata | 11 | 音频元数据解析 |
| lucide-react | 1 | 图标 |

## 架构

```
┌──────────────────────────────────────────────────────────────┐
│  bun run dev                                                 │
│                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Vite Dev Server │  │  Electrobun  │  │  Audio Server   │ │
│  │ :1420           │  │  (Bun 主进程) │  │  :1421          │ │
│  │                 │  │              │  │                 │ │
│  │ React + HMR     │  │  RPC Handler │  │ 音频流 + 封面    │ │
│  └────────┬────────┘  └──────┬───────┘  └────────┬────────┘ │
│           │     WebSocket RPC│                    │          │
│           └──────────────────┼────────────────────┘          │
│                    WebView (WebKitGTK)                       │
│                  ┌───────────┴───────────┐                   │
│                  │  Sidebar │ Content    │                   │
│                  │          │            │                   │
│                  │          │ Artists /  │                   │
│                  │          │ Songs view │                   │
│                  │──────────┴────────────│                   │
│                  │  ▶ Player Bar         │                   │
│                  └───────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```
