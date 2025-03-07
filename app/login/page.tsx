'use client'
import { signIn } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FullScreenLoading } from '@/components/ScreenLoading'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  function handleLogin(type: 'github' | 'google') {
    setIsLoading(true)

    signIn(type, { callbackUrl: '/ai' }).catch(() => {
      setIsLoading(false)
      toast('登录失败!')
    })
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <h1 className="text-3xl font-bold py-6 px-4">
        <Link href="/"> AI Chat</Link>
      </h1>

      <div className="pt-[26vh]">
        <div className="text-3xl font-bold py-6 px-4 text-center">Log in</div>

        <div className=" w-3/12 mx-auto space-y-4 text-black">
          <Button
            className="w-full text-center text-lg font-medium bg-white cursor-pointer"
            onClick={() => handleLogin('github')}
            size="lg"
          >
            <Icon icon="mdi:github" className="mr-1 h-6! w-6!" />
            <span>Github</span>
          </Button>

          <Button
            className="w-full text-center text-lg font-medium bg-white cursor-pointer"
            onClick={() => handleLogin('google')}
            size="lg"
          >
            <Icon icon="flat-color-icons:google" className="mr-1 h-6! w-6!" />
            <span>Google</span>
          </Button>
        </div>
      </div>

      <FullScreenLoading isLoading={isLoading} message="正在登录..."></FullScreenLoading>
    </div>
  )
}
