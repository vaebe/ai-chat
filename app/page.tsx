import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-2">
        <div className="text-2xl font-bold">AI Chat</div>

        <Link href="/login">
          <Button>登录</Button>
        </Link>
      </header>

      <p className="text-center">一个使用 next 开发 AI 对话页面,完善中...</p>

      <div className="w-10/12 mx-auto my-10">
        <img src="/img/chat.jpg" alt="" className="w-full" />
      </div>
    </main>
  )
}
