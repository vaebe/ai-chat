import { createDeepSeek } from '@ai-sdk/deepseek'

export const deepSeekProvider = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? ''
})
