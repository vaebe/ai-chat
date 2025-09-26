import { cn } from '@/lib/utils'

interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loading({ text = '加载中...', size = 'md', className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100', sizeClasses[size])}></div>
      <span className={cn('ml-2 text-gray-600 dark:text-gray-400', textSizeClasses[size])}>{text}</span>
    </div>
  )
}
