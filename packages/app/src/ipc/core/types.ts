/**
 * 从 handler 实现自动推导 RPC 类型，无需手动维护类型定义
 *
 * 用法：写一次 handler → typeof handler → InferRequests 自动推导 params + response
 */

type AnyFn = (...args: any[]) => any

/**
 * 从 request handler 对象推导出 RPC requests 类型
 *
 * handler: `{ readFile: ({ path }: { path: string }) => string }`
 *      →   `{ readFile: { params: { path: string }, response: string } }`
 */
export type InferRequests<T extends Record<string, AnyFn>> = {
  [K in keyof T]: {
    params: Parameters<T[K]>[0] extends undefined ? {} : Parameters<T[K]>[0]
    response: Awaited<ReturnType<T[K]>>
  }
}

/**
 * 从 message handler 对象推导出 RPC messages 类型
 *
 * handler: `{ log: ({ msg }: { msg: string }) => void }`
 *      →   `{ log: { msg: string } }`
 */
export type InferMessages<T extends Record<string, AnyFn>> = {
  [K in keyof T]: Parameters<T[K]>[0]
}
