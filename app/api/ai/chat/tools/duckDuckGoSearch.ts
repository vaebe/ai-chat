import { tool } from 'ai'
import { z } from 'zod'

// todo 未完成 - 无法使用
export const duckDuckGoSearchTool = tool({
  description: '使用 DuckDuckGo 进行搜索，返回相关摘要信息。',
  inputSchema: z.object({
    query: z.string().describe('要搜索的关键词')
  }),
  execute: async ({ query }) => {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`
    const response = await fetch(url)
    const data = await response.json()

    console.log(query, response)

    return {
      query,
      abstract: data.Abstract || '未找到相关摘要信息',
      source: data.AbstractURL || 'https://duckduckgo.com/'
    }
  }
})
