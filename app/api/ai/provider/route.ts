import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/prisma'
import { encrypt } from '@/lib/crypto'
// 模型信息改为从数据库读取

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ code: 401, msg: '无权限!' }, { status: 401 })

  const list = await prisma.aiProviderConfig.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  })

  // 屏蔽密钥
  const safe = list.map((i) => ({ ...i, apiKeyEnc: undefined }))
  return NextResponse.json({ code: 0, msg: 'ok', data: safe })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ code: 401, msg: '无权限!' }, { status: 401 })

  const body = await req.json()
  const { provider, model, apiKey, baseURL, isDefault } = body || {}
  if (!provider || !model || !apiKey) {
    return NextResponse.json({ code: 400, msg: '参数不正确!' }, { status: 400 })
  }

  const modelInfo = await prisma.aiModel.findFirst({
    where: { provider, model, deletedAt: null }
  })
  const modelType = modelInfo?.type
  const capabilities = modelInfo?.capabilities

  if (isDefault) {
    await prisma.aiProviderConfig.updateMany({
      where: { userId },
      data: { isDefault: false }
    })
  }

  const data = await prisma.aiProviderConfig.create({
    data: {
      userId,
      provider,
      model,
      apiKeyEnc: encrypt(apiKey),
      ...(baseURL ? { baseURL } : {}),
      isDefault: !!isDefault,
      ...(modelType ? { modelType } : {}),
      ...(capabilities ? { capabilities } : {})
    }
  })

  return NextResponse.json({ code: 0, msg: '创建成功', data: { ...data, apiKeyEnc: undefined } })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ code: 401, msg: '无权限!' }, { status: 401 })
  const body = await req.json()
  const { id, provider, model, apiKey, baseURL, isDefault } = body || {}
  if (!id) return NextResponse.json({ code: 400, msg: '参数不正确!' }, { status: 400 })

  if (isDefault) {
    await prisma.aiProviderConfig.updateMany({
      where: { userId },
      data: { isDefault: false }
    })
  }

  let modelType: string | undefined
  let capabilities: string | undefined
  if (provider && model) {
    const row = await prisma.aiModel.findFirst({
      where: { provider, model, deletedAt: null }
    })
    modelType = row?.type
    capabilities = row?.capabilities
  }

  const data = await prisma.aiProviderConfig.update({
    where: { id },
    data: {
      ...(provider ? { provider } : {}),
      ...(model ? { model } : {}),
      ...(apiKey ? { apiKeyEnc: encrypt(apiKey) } : {}),
      ...(baseURL ? { baseURL } : {}),
      ...(typeof isDefault === 'boolean' ? { isDefault } : {}),
      ...(modelType ? { modelType } : {}),
      ...(capabilities ? { capabilities } : {})
    }
  })
  return NextResponse.json({ code: 0, msg: '更新成功', data: { ...data, apiKeyEnc: undefined } })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ code: 401, msg: '无权限!' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ code: 400, msg: '参数不正确!' }, { status: 400 })

  await prisma.aiProviderConfig.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ code: 0, msg: '删除成功' })
}
