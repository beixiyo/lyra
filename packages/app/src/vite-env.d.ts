/// <reference types="vite/client" />

// Electrobun 以 .ts 源码发布（非编译后 .d.ts），skipLibCheck 无效。
// 其内部引用了 three 但未提供类型，导致 TS7016。待上游修复后移除。
declare module 'three'
