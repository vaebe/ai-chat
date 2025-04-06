#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// 创建 MCP 服务器
const server = new McpServer({
  name: 'github-search-mcp-server',
  version: '1.0.0'
})

// 注册搜索工具
server.tool(
  'search_github',
  '在 GitHub 上搜索仓库、代码、Issues 或用户',
  {
    query: z.string(),
    page: z.number().optional().default(1),
    perPage: z.number().optional().default(30),
    type: z.enum(['repositories', 'code', 'issues', 'users'])
  },
  async ({ query, page, perPage, type }) => {
    const url = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    })

    console.warn('sdasdasdas', process.env.GITHUB_TOKEN)

    if (!res.ok) {
      throw new Error(`GitHub API 错误: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }
)

server.tool(
  'get_github_user',
  '获取指定 GitHub 用户的详细信息',
  {
    username: z.string().describe('GitHub 的用户名')
  },
  async ({ username }) => {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    })

    if (!res.ok) {
      throw new Error(`获取用户信息失败: ${res.status} ${res.statusText}`)
    }

    return await res.json()
  }
)

// 启动服务器
async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.warn('GitHub 搜索 MCP 服务器已在 stdio 上启动')
}

runServer().catch((error) => {
  console.error('启动服务器时出错:', error)
  process.exit(1)
})
