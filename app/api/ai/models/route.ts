import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') || undefined
  const list = await prisma.aiModel.findMany({
    where: {
      deletedAt: null,
      ...(provider ? { provider } : {})
    },
    orderBy: [
      { recommended: 'desc' as const },
      { provider: 'asc' as const },
      { displayName: 'asc' as const }
    ]
  })
  return NextResponse.json({ code: 0, msg: 'ok', data: list })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { provider, model, displayName, type, capabilities, recommended } = body || {}
  if (!provider || !model || !displayName || !type || !capabilities) {
    return NextResponse.json({ code: 400, msg: '参数不正确!' }, { status: 400 })
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
    return NextResponse.json({ code: 0, msg: '创建成功', data })
  } catch (e) {
    return NextResponse.json({ code: -1, msg: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, provider, model, displayName, type, capabilities, recommended } = body || {}
  if (!id) return NextResponse.json({ code: 400, msg: '参数不正确!' }, { status: 400 })

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
    return NextResponse.json({ code: 0, msg: '更新成功', data })
  } catch (e) {
    return NextResponse.json({ code: -1, msg: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ code: 400, msg: '参数不正确!' }, { status: 400 })

  try {
    await prisma.aiModel.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ code: 0, msg: '删除成功' })
  } catch (e) {
    return NextResponse.json({ code: -1, msg: String(e) }, { status: 500 })
  }
}
