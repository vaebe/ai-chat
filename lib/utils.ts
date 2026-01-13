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

// 品牌图标映射表，用于处理特殊情况
const PROVIDER_ICON_MAP: Record<string, string> = {
  alibaba: 'alibaba',
  anthropic: 'anthropic',
  deepseek: 'deepseek',
  google: 'google',
  meta: 'llama', // Meta 的模型使用 llama 图标
  mistral: 'mistral',
  openai: 'openai'
}

// 根据模型 ID 获取正确的图标 provider
function getModelIconProvider(modelId: string): string {
  // 从 modelId 中提取品牌部分（斜杠前的部分）
  // 例如: "alibaba/qwen-3-14b" -> "alibaba"
  const brand = modelId.split('/')[0]?.toLowerCase() || ''

  // 使用映射表获取对应的图标 provider，如果没有映射则直接使用品牌名
  return PROVIDER_ICON_MAP[brand] || brand
}

// 获取 ai gateway 的模型列表
export async function getAiGatewayModels(): Promise<GatewayLanguageModelEntry[]> {
  const availableModels = await gateway.getAvailableModels()

  return availableModels.models
    .filter((model) => {
      // 不是语言模型直接返回
      if (model.modelType !== 'language') {
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
    .map((model) => ({
      ...model,
      specification: {
        ...model.specification,
        // 保留原始 provider（API 提供商）
        apiProvider: model.specification?.provider || '',
        // provider 字段改为品牌图标
        provider: getModelIconProvider(model.specification?.modelId || model.id)
      }
    }))
}
