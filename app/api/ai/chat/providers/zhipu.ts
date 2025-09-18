import { createOpenAI } from '@ai-sdk/openai'

export const zhipuProvider = createOpenAI({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
  apiKey: process.env.ZHIPU_AI ?? ''
})
