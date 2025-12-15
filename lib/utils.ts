import { type ClassValue, clsx } from 'clsx'
import { NextResponse } from 'next/server'
import { twMerge } from 'tailwind-merge'
import { NextRequest } from 'next/server'
import { gateway, type GatewayLanguageModelEntry } from '@ai-sdk/gateway'

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

// 获取 ai gateway 的模型列表
export async function getAiGatewayModels(): Promise<GatewayLanguageModelEntry[]> {
  const availableModels = await gateway.getAvailableModels()

  return availableModels.models.filter((model) => {
    // 不是语言模型直接返回
    if (model.modelType !== 'language') {
      return false
    }

    if (!['alibaba', 'anthropic', 'google', 'deepseek'].some((item) => model.id.startsWith(item))) {
      return false
    }

    const inputPricing = Number(model?.pricing?.input) || 0
    const outputPricing = Number(model?.pricing?.output) || 0
    // 价格不存在直接返回
    if (!inputPricing || !outputPricing) {
      return false
    }

    return inputPricing * 1000000 < 0.5 && outputPricing * 1000000 < 0.5
  })
}
