import { tool } from 'ai'
import { z } from 'zod'
import dayjs from 'dayjs'

export const timeTool = tool({
  description: '获取当前的 Unix 时间戳（毫秒）、日期北京时间（YYYY-MM-DD HH:mm:ss）',
  inputSchema: z.object({}),
  execute: async () => {
    const day = dayjs()
    return {
      timestamp: day.unix(),
      date: day.format('YYYY-MM-DD HH:mm:ss')
    }
  }
})
