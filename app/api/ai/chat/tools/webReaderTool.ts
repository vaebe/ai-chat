import { tool } from 'ai'
import { z } from 'zod'
import * as cheerio from 'cheerio'

export const webReaderTool = tool({
  description: '从指定网址抓取网页内容，并提取正文信息。',
  parameters: z.object({
    url: z.string().url().describe('要读取的网页 URL')
  }),
  execute: async ({ url }) => {
    // todo 由免费 ai 生成回答后吐给 运行的 ai 进行回答
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-WebReader/1.0)'
        }
      })

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      let text =
        $('article').text() || // 文章页面
        $('main').text() || // 主体内容
        $('body').text() // 兜底

      // 限制长度 2000
      text = text.replace(/\s+/g, ' ').trim().slice(0, 2000)

      return {
        url,
        content: text || '未能提取正文内容。'
      }
    } catch (error) {
      return { url, content: `抓取失败: ${(error as Error).message}` }
    }
  }
})
