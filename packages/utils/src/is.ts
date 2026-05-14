export const isString = (v: unknown): v is string => typeof v === 'string'

export const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v)

export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'

export const isFunction = (v: unknown): v is Function => typeof v === 'function'

export const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)

export const isArray = Array.isArray

export const isNullish = (v: unknown): v is null | undefined => v == null

export const isDefined = <T>(v: T | null | undefined): v is T => v != null

export const isBrowser = typeof window !== 'undefined'
