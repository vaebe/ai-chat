declare global {
  // 扩展 fetch Response 字段
  interface Response {
    code?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
    msg?: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>
