'use client'

import '@/lib/date'
import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

function ClerkWithThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined
      }}
    >
      {children}
      <Toaster position="top-center" />
    </ClerkProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkWithThemeProvider>{children}</ClerkWithThemeProvider>
    </ThemeProvider>
  )
}
