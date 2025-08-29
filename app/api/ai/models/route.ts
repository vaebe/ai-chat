import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') || undefined
  const list = await (prisma as any).aiModel.findMany({
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
