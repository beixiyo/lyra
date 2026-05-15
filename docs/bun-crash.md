# Bun Crash: Segmentation fault at address 0x8

## 现象

运行 Bun 进程（开发服务器、HTTP 服务、长时间任务等）时出现如下崩溃：

```
panic: Segmentation fault at address 0x8
[bun] │ oh no: Bun has crashed. This indicates a bug in Bun, not your code.
```

**这不是你的代码问题，是 Bun runtime 的已知 Bug。**

## 根本原因

`0x8` 是空指针偏移访问的特征地址（`null + 8`），说明 Bun 内部 C/Zig 代码在访问某个 struct 字段时，指针为 null。属于内存安全问题。

## 相关 Issue

| Issue | 场景 | 状态 |
|-------|------|------|
| [#27439](https://github.com/oven-sh/bun/issues/27439) | `bun create next-app` 触发 | 开放 |
| [#21002](https://github.com/oven-sh/bun/issues/21002) | HTTP 服务 + Redis + SQL，运行约 2 小时后崩溃 | 开放 |
| [#22775](https://github.com/oven-sh/bun/issues/22775) | macOS 长时间运行 | 开放 |
| [#30418](https://github.com/oven-sh/bun/issues/30418) | 长时间运行 + 并发子进程，空闲时崩溃 | 开放 |
| [#26984](https://github.com/oven-sh/bun/issues/26984) | 长时间运行，伴随内存统计数据异常 | 开放 |

## 触发规律

- 与框架无关（Hono、Next.js、原生 HTTP 均有报告）
- 长时间运行（2 小时以上）概率明显上升
- 高并发子进程场景风险更高
- 偶发，不是每次必现

## 官方修复进展

Bun 于 **2026-05-14** 合并 [PR #30412](https://github.com/oven-sh/bun/pull/30412)，将整个运行时从 Zig **重写为 Rust**，目标正是消灭此类内存安全崩溃。

PR 描述原文：
> *"we now have compiler-assisted tools for catching & preventing memory bugs, which have costed the team an enormous amount of development & debugging time over the years"*

Rust 重写版目前仅在 **canary** 渠道，尚未进入 stable：

```bash
bun upgrade --canary  # 尝鲜
```

## 临时应对方案

### 开发环境

崩了重新运行即可，偶发不影响开发。

### 生产环境（Docker）

确保 `docker-compose.yml` 中配置了自动重启：

```yaml
services:
  api:
    restart: unless-stopped
```

进程崩溃后容器会在几秒内自动重启，对用户影响极小。

### 生产环境（非 Docker）

```bash
# PM2
pm2 start "bun run src/index.ts" --name api

# systemd
[Service]
Restart=always
RestartSec=2
ExecStart=/home/user/.bun/bin/bun run /app/src/index.ts
```
