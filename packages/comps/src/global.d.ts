interface PromiseWithResolvers<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

declare interface PromiseConstructor {
  withResolvers: <T>() => PromiseWithResolvers<T>
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.module.css' {
  const content: Record<string, string>
  export default content
}
