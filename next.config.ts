import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['@modelcontextprotocol/sdk']
}

export default nextConfig
