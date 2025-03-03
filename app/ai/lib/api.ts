import { toast } from 'sonner'

// 获取 AI 对话列表
export async function getConversation() {
  try {
    const res = await fetch('/api/ai/conversation/list').then((res) => res.json())

    if (res.code !== 0) {
      toast('获取对话失败!')
      return []
    }
    return res.data.list ?? []
  } catch {
    toast('获取对话失败!')
    return []
  }
}
