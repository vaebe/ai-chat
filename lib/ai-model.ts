import { prisma } from '@/prisma'
import { ApiRes } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'

interface CreateAiModelProps {
  provider: string
  model: string
  displayName: string
  type: 'chat' | 'reasoning' | 'multimodal'
  capabilities: Record<string, unknown> | string
  recommended?: boolean
}

// 创建模型目录项
export async function createAiModel(props: CreateAiModelProps): Promise<ApiRes> {
  const { userId } = await auth()
  if (!userId) return { code: 401, msg: '无权限!' }

  const { provider, model, displayName, type, capabilities, recommended } = props
  if (!provider || !model || !displayName || !type || !capabilities) {
    return { code: 400, msg: '参数不正确!' }
  }

  try {
    const data = await prisma.aiModel.create({
      data: {
        provider,
        model,
        displayName,
        type,
        capabilities:
          typeof capabilities === 'string' ? capabilities : JSON.stringify(capabilities),
        recommended: !!recommended
      }
    })
    return { code: 0, msg: '创建成功', data }
  } catch (error) {
    return { code: -1, msg: `创建失败: ${error}` }
  }
}

// 获取模型目录
export async function getAiModels(provider?: string): Promise<ApiRes> {
  const { userId } = await auth()
  if (!userId) return { code: 401, msg: '无权限!' }

  try {
    const where: any = { deletedAt: null }
    if (provider) where.provider = provider
    const list = await prisma.aiModel.findMany({
      where,
      orderBy: [{ recommended: 'desc' }, { provider: 'asc' }, { displayName: 'asc' }]
    })
    return { code: 0, msg: '获取成功', data: list }
  } catch (error) {
    return { code: -1, msg: `获取失败: ${error}` }
  }
}

interface UpdateAiModelProps {
  id: string
  provider?: string
  model?: string
  displayName?: string
  type?: 'chat' | 'reasoning' | 'multimodal'
  capabilities?: Record<string, unknown> | string
  recommended?: boolean
}

// 更新模型目录项
export async function updateAiModel(props: UpdateAiModelProps): Promise<ApiRes> {
  const { userId } = await auth()
  if (!userId) return { code: 401, msg: '无权限!' }

  const { id, provider, model, displayName, type, capabilities, recommended } = props
  if (!id) return { code: 400, msg: '参数不正确!' }

  try {
    const data = await prisma.aiModel.update({
      where: { id },
      data: {
        ...(provider ? { provider } : {}),
        ...(model ? { model } : {}),
        ...(displayName ? { displayName } : {}),
        ...(type ? { type } : {}),
        ...(typeof recommended === 'boolean' ? { recommended } : {}),
        ...(capabilities
          ? {
              capabilities:
                typeof capabilities === 'string' ? capabilities : JSON.stringify(capabilities)
            }
          : {})
      }
    })
    return { code: 0, msg: '更新成功', data }
  } catch (error) {
    return { code: -1, msg: `更新失败: ${error}` }
  }
}

// 软删除模型目录项
export async function removeAiModel(id: string): Promise<ApiRes> {
  const { userId } = await auth()
  if (!userId) return { code: 401, msg: '无权限!' }
  if (!id) return { code: 400, msg: '参数不正确!' }

  try {
    await prisma.aiModel.update({ where: { id }, data: { deletedAt: new Date() } })
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    return { code: -1, msg: `删除失败: ${error}` }
  }
}
