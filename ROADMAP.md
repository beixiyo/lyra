# Lyra Roadmap

## Phase 1 — Core Foundation

> 扫描、播放、基础交互

- [x] 递归目录扫描 + 元数据解析（music-metadata）
- [x] 文件夹分类（艺术家视图）
- [x] 基础播放控制（播放 / 暂停 / 上下首 / 进度 / 音量）
- [x] 封面提取 + HTTP 服务端缓存
- [x] Apple Music 风格暗色 UI
- [ ] 目录选择器（支持多目录、记住上次选择）
- [ ] 持久化设置（localStorage：音量、上次播放、目录列表）
- [ ] 搜索 & 筛选（标题 / 艺术家 / 专辑模糊匹配）
- [ ] 专辑视图（按专辑聚合，封面网格）

## Phase 2 — Theme System

> TailwindCSS 4 `@theme` Token 化，可定制主题

- [ ] TailwindCSS `@theme` Token 体系（`--color-bg`, `--color-accent`, `--color-surface`, `--color-text-*`, `--radius-*`, `--spacing-*`）
- [ ] 运行时切换：修改 `document.documentElement` CSS 变量，Tailwind class 自动响应
- [ ] 内置主题：Dark（默认）/ Light / Nord / Rosé Pine
- [ ] 专辑色提取（从封面取主色调 + 辅色，Canvas / WASM 算法）
- [ ] 动态主题（播放时背景/强调色跟随专辑色渐变过渡）
- [ ] 主题编辑器 UI（实时预览，色板选择）
- [ ] 主题导入 / 导出（JSON 格式，社区共享）
- [ ] 强调色自定义（覆盖专辑色提取）
- [ ] 毛玻璃 / 透明度 / 模糊度可调

## Phase 3 — Keybindings

> 全局 & 应用内快捷键，完全可定制

- [ ] 默认快捷键方案（Space 播放、← → 快进、↑ ↓ 音量…）
- [ ] 快捷键录入 UI（按下组合键实时捕获，冲突检测）
- [ ] 快捷键持久化（JSON 配置文件）
- [ ] 全局快捷键（Electrobun GlobalShortcut，窗口外也生效）
- [ ] 快捷键方案导入 / 导出
- [ ] 预设方案（Default / Vim-style / Media-key-only）

## Phase 4 — Lyrics

> 内嵌歌词 + 桌面悬浮歌词

- [ ] 内嵌歌词展示面板（侧边栏或全屏）
- [ ] 逐行同步高亮（LRC 时间轴）
- [ ] 非同步歌词（纯文本滚动）
- [ ] 外挂 `.lrc` 文件自动匹配（同名文件）
- [ ] 桌面悬浮歌词（独立置顶窗口，可拖拽定位）
- [ ] 歌词样式可定制（字体、大小、颜色、描边、透明度）
- [ ] 双语歌词（翻译行）
- [ ] 歌词偏移校准（± 毫秒微调）

## Phase 5 — Playback Advanced

> 播放体验进阶

- [ ] 播放队列管理（添加到下一首、队列排序、拖拽）
- [ ] 随机 / 单曲循环 / 列表循环
- [ ] Gapless 播放（预加载下一首，Web Audio API crossfade）
- [ ] 播放速度调节（0.5x – 2.0x）
- [ ] 音频可视化（频谱 / 波形，AnalyserNode）
- [ ] 播放历史记录
- [ ] 智能播放列表（按最近添加 / 最多播放 / 随机发现）
- [ ] 均衡器（EQ，Web Audio API BiquadFilter）

## Phase 6 — System Integration

> 系统级能力

- [ ] 系统媒体键支持（Media Play/Pause/Next/Prev）
- [ ] 系统托盘图标 + 托盘菜单
- [ ] Mini Player 模式（悬浮小窗）
- [ ] MPRIS 支持（Linux D-Bus 媒体控制）
- [ ] 系统通知（切歌时显示封面 + 歌名）
- [ ] 文件关联（双击 .mp3/.flac 直接用 Lyra 打开）
- [ ] 库数据库化（SQLite，增量扫描，大库性能）

## Phase 7 — Distribution

> 打包、更新、跨平台

- [ ] 自动更新（Electrobun Updater，canary / stable 通道）
- [ ] Linux：AppImage / .deb / .tar.gz
- [ ] macOS：.dmg（签名 + 公证）
- [ ] Windows：.exe installer
- [ ] GitHub Actions CI/CD（tag 触发自动构建发布）
- [ ] 崩溃上报（Sentry / 自建）

---

**优先级排序**：P1 Core（播放 UI）→ P2 Theme → P3 Keybindings → P4 Lyrics → P5 Playback（EQ 最后）→ P6 System → P7 Distribution
