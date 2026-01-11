import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true, // 启用 React Compiler 实现自动记忆化优化
  images: {
    formats: ['image/avif', 'image/webp'] // 优先 avif，其次 webp
  }
}

export default nextConfig
