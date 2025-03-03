'use client'

import '@/lib/date'
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster position="bottom-center"/>
      </ThemeProvider>
    </SessionProvider>
  )
}
