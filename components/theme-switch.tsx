'use client'

import { useTheme } from 'next-themes'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  function themeChange(checked: boolean) {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-switch"
        className="cursor-pointer"
        checked={isDark}
        onCheckedChange={themeChange}
      />
      <Label htmlFor="theme-switch">{isDark ? '深色' : '浅色'}</Label>
    </div>
  )
}
