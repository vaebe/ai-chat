import { type ClassValue, clsx } from 'clsx'
import { NextResponse } from 'next/server'
import { twMerge } from 'tailwind-merge'
import { NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SendJson<T = unknown> {
  code?: number
  data?: T
  msg?: string
}

export interface ApiRes<T = unknown> {
  code: number
  msg: string
  data?: T
}

export interface PaginationResData<T = unknown> {
  code: number
  msg: string
  data?: {
    list: T[]
    total: number
    currentPage: number
    totalPages: number
  }
}

export function sendJson(opts: Partial<SendJson>) {
  return NextResponse.json({ code: 0, msg: '', ...opts }, { status: 200 })
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function getFileHash(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] || // Vercel 代理
    req.headers.get('cf-connecting-ip') || // Cloudflare 代理
    req.headers.get('x-real-ip') || // 备用
    'Unknown'
  )
}
