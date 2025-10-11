import { createHuggingFace } from '@ai-sdk/huggingface'

export const huggingface = createHuggingFace({
  apiKey: process.env.HUGGINGFACE_API_KEY ?? ''
})
