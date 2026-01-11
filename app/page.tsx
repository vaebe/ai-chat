'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MessageSquare, Zap, Search, Github, Moon, Shield, ArrowRight, Sparkles, ExternalLink } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function HomeHeader() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) {
    return (
      <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl">
        <div className="h-14 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl" />
      </header>
    )
  }

  return (
    <header
      className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl transition-all duration-300 ${
        scrolled ? 'top-2' : 'top-4'
      }`}
    >
      <nav
        className={`flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 shadow-lg shadow-orange-500/5'
            : 'bg-white/70 dark:bg-slate-900/70'
        } border border-orange-100/50 dark:border-slate-700/50`}
      >
        <div className="flex items-center gap-2 pl-2">
          <Image
            src={theme === 'dark' ? '/logo/light.svg' : '/logo/dark.svg'}
            alt="AI Chat Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold bg-linear-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            AI Chat
          </span>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <ThemeSwitch />

          <Link href="/sign-in">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer hidden sm:flex rounded-full px-6 hover:text-orange-600 hover:bg-orange-50/50"
            >
              登录
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button
              size="sm"
              className="cursor-pointer rounded-full px-6 bg-linear-to-r from-orange-500 to-rose-500 hover:scale-105 transition-transform duration-200 text-white shadow-lg shadow-orange-500/20 border-0"
            >
              开始使用
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Aurora 动画背景 - 暖色调 */}
      <div className="absolute inset-0 -z-10">
        {/* 浅色模式渐变 */}
        <div className="dark:hidden absolute inset-0 bg-linear-to-br from-orange-50 via-white to-rose-50" />
        <div className="dark:hidden absolute top-0 left-1/4 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="dark:hidden absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="dark:hidden absolute top-1/3 right-1/3 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl animate-pulse delay-500" />

        {/* 深色模式渐变 */}
        <div className="hidden dark:block absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="hidden dark:block absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="hidden dark:block absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="hidden dark:block absolute top-1/3 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium mb-8 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50">
            <Sparkles className="w-4 h-4" />
            AI 智能助手
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-slate-900 dark:text-white">功能完整的</span>
            <br />
            <span className="bg-linear-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
              现代化 AI 助手
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            支持实时流式响应、联网搜索与 GitHub 代码分析。
            <br className="hidden sm:block" />
            基于 Next.js 16 和 Vercel AI SDK 构建，提供流畅的对话体验。
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/ai">
              <Button
                size="lg"
                className="cursor-pointer w-full sm:w-auto bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-xl shadow-orange-500/25 px-8 py-6 text-lg border-0 rounded-full hover:scale-105 transition-transform duration-200"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                开始聊天
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-orange-300 dark:border-slate-500 flex items-start justify-center p-2">
          <div className="w-1.5 h-2.5 bg-orange-400 dark:bg-slate-500 rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: MessageSquare,
    title: '智能对话',
    description: '自然流畅的交流体验，智能理解上下文。',
    gradient: 'from-orange-400 to-amber-400',
    span: 'col-span-1'
  },
  {
    icon: Zap,
    title: '极速响应',
    description: '实时流式传输，即刻呈现 AI 思考结果。',
    gradient: 'from-amber-400 to-yellow-400',
    span: 'col-span-1'
  },
  {
    icon: Search,
    title: '联网搜索',
    description: '集成全网搜索能力，获取最新资讯与答案。',
    gradient: 'from-rose-400 to-pink-400',
    span: 'col-span-1'
  }
]

function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">简单，却不简单</h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group ${feature.span} p-8 rounded-3xl bg-orange-50/50 dark:bg-slate-900/50 backdrop-blur-sm border border-orange-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/50 dark:hover:shadow-none cursor-default`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-md text-white`}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* 背景渐变 - 暖色 */}
      <div className="absolute inset-0 bg-linear-to-r from-orange-400 via-rose-400 to-amber-400" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 drop-shadow-sm">开启您的 AI 之旅</h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-xl mx-auto font-medium">现在注册，立即体验。</p>
          <Link href="/ai">
            <Button
              size="lg"
              className="cursor-pointer bg-white text-orange-600 hover:bg-orange-50 shadow-xl px-12 py-7 text-lg font-bold rounded-full border-0"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              免费开始
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 bg-orange-50 dark:bg-slate-950 border-t border-orange-100 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-slate-900 dark:text-white">AI Chat</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">© 2026</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/vaebe/ai-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-orange-200 selection:text-orange-900">
      <HomeHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
