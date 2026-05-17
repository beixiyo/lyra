# Lyra Roadmap

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

**优先级排序**：P1 Core → **P1.5 i18n** → P2 Theme → P3 Keybindings → P4 Lyrics → P5 Playback（EQ 最后）→ P6 System → P7 Distribution
