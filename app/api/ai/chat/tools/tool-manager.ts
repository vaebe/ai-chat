import { experimental_createMCPClient as createMCPClient } from 'ai'
import { tool, Tool } from 'ai'
import { z } from 'zod'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const ignoreGithubTools = [
  'copilot',
  'team',
  'create',
  'add',
  'delete',
  'update',
  'notification',
  'workflow',
  'fork',
  'job',
  'push',
  'pull',
  'dependabot',
  'unstar',
  'security'
]

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>

export interface ToolsConfig {
  enableWebSearch?: boolean
}

export class ToolManager {
  private mcpClients: Array<{ client: MCPClient; name: string }> = []
  private allTools: Record<string, Tool> = {}

  async initialize(userControlledTools: ToolsConfig = {}) {
    try {
      // AI 自主决定的工具 - GitHub MCP
      await this.initializeGithubMCP()

      // 用户控制的工具
      if (userControlledTools.enableWebSearch && process.env.SEARCH_API_KEY) {
        await this.initializeWebSearchTools()
      }

      console.log(`✅ 已初始化工具:`, Object.keys(this.allTools))
    } catch (error) {
      console.error('❌ 初始化工具时出错:', error)
    }

    return this
  }

  private async initializeGithubMCP() {
    try {
      const mcpUrl = new URL('https://api.githubcopilot.com/mcp/')
      const mcpClient = await createMCPClient({
        transport: new StreamableHTTPClientTransport(mcpUrl, {
          requestInit: {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`
            }
          }
        })
      })

      this.mcpClients.push({ client: mcpClient, name: 'github' })

      // 使用 schema discovery 方式获取所有 GitHub 工具
      const githubTools = await mcpClient.tools()

      // 将 GitHub 工具添加到总工具集合中，添加前缀避免冲突
      Object.entries(githubTools).forEach(([name, tool]) => {
        if (ignoreGithubTools.some((item) => name.toLowerCase().includes(item))) {
          return
        }

        this.allTools[`github_${name}`] = tool
      })

      console.log('✅ GitHub MCP 服务器连接成功')
    } catch (error) {
      console.warn('⚠️ GitHub MCP 连接失败，使用备用实现:', error)
    }
  }

  private async initializeWebSearchTools() {
    const webSearchTool = tool({
      description: '在网络上搜索信息',
      inputSchema: z.object({
        query: z.string().describe('搜索查询'),
        max_results: z.number().default(5).describe('最大结果数量')
      }),
      execute: async ({ query, max_results }) => {
        try {
          // 这里使用实际的搜索 API
          const searchUrl = `https://api.search-provider.com/search?q=${encodeURIComponent(query)}&limit=${max_results}`

          const response = await fetch(searchUrl, {
            headers: {
              Authorization: `Bearer ${process.env.SEARCH_API_KEY}`
            }
          })

          const data = await response.json()

          const results =
            data.results?.map(
              (result: { title: string; url: string; snippet: string; date: string }) => ({
                title: result.title,
                url: result.url,
                snippet: result.snippet,
                published_date: result.date
              })
            ) || []

          return {
            success: true,
            results,
            query
          }
        } catch (error) {
          return {
            success: false,
            error: `网络搜索失败: ${error}`,
            query
          }
        }
      }
    })

    this.allTools['web_search'] = webSearchTool
    console.log('✅ 网络搜索工具已启用')
  }

  getAllTools() {
    return this.allTools
  }

  getEnabledToolNames() {
    return Object.keys(this.allTools)
  }

  async closeAll() {
    for (const { client } of this.mcpClients) {
      try {
        await client.close()
      } catch (error) {
        console.warn('关闭 MCP 客户端时出错:', error)
      }
    }
    this.mcpClients = []
  }

  // 获取工具分类信息，用于系统提示
  getToolsDescription() {
    const toolNames = Object.keys(this.allTools)
    const aiControlledTools = toolNames.filter((name) => name.startsWith('github_'))
    const userControlledTools = toolNames.filter((name) => !name.startsWith('github_'))

    let description = ''

    if (aiControlledTools.length > 0) {
      description += '\n## AI 可用工具（自主决定使用）：\n'
      description += `- **GitHub**: ${aiControlledTools.join(', ')}\n`
    }

    if (userControlledTools.length > 0) {
      description += '\n## 用户启用工具（按需使用）：\n'
      userControlledTools.forEach((toolName) => {
        const category = toolName.split('_')[0]
        description += `- **${category}**: ${toolName}\n`
      })
    }

    return description
  }
}
