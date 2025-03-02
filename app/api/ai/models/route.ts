import { sendJson } from '@/lib/utils'
import { auth } from '@/auth'

// todo 获取用户可以使用的模型
export async function GET() {
  // 未登录返回 null
  const session = await auth()

  // 判断用户 id 是否存在执行对应的逻辑
  if (!session?.user?.id) {
    return sendJson({ code: 401, msg: `无权限!` })
  }

  try {
    return sendJson({ data: [] })
  } catch (error) {
    console.error(error)
    return sendJson({ code: -1, msg: '获取模型失败!' })
  }
}
