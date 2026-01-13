import { Tool } from 'ai'
import { webSearch } from '@exalabs/ai-sdk'
import { githubTools } from './github-tools'

interface ToolsState {
  tools: Record<string, Tool>
  categories: {
    ai: string[] // AI 自主决定使用的工具
    user: string[] // 用户启用的工具
  }
}

// 初始化 GitHub 工具
function initGithub(state: ToolsState) {
  try {
    Object.entries(githubTools).forEach(([name, tool]) => {
      state.tools[name] = tool
      state.categories.ai.push(name) // 记录为 AI 工具
    })

    console.log('✅ GitHub 工具已加载')
  } catch (error) {
    console.warn('⚠️ GitHub 工具加载失败:', error)
  }
}

// 初始化网络搜索
function initWebSearch(state: ToolsState) {
  const toolName = 'web_search'
  state.tools[toolName] = webSearch({
    apiKey: process.env.EXA_API_KEY,
    type: 'auto',
    numResults: 6,
    category: 'company',
    contents: {
      text: { maxCharacters: 1000 },
      livecrawl: 'preferred',
      summary: true
    }
  })
  state.categories.user.push(toolName) // 记录为用户工具
  console.log('✅ 网络搜索已启用')
}

export interface ToolsConfig {
  enableWebSearch?: boolean
}

// 主初始化函数
export async function createTools(config: ToolsConfig = {}) {
  const state: ToolsState = {
    tools: {},
    categories: {
      ai: [],
      user: []
    }
  }

  try {
    // AI 自主工具
    initGithub(state)

    // 用户控制工具
    if (config.enableWebSearch) {
      initWebSearch(state)
    }

    console.log('✅ 已初始化工具:', Object.keys(state.tools))
  } catch (error) {
    console.error('❌ 初始化失败:', error)
  }

  return {
    // 获取所有工具
    getAllTools: () => state.tools,

    // 获取工具名称列表
    getNames: () => Object.keys(state.tools),

    // 获取工具描述
    getDesc: () => {
      let desc = ''

      if (state.categories.ai.length > 0) {
        desc += '\n## AI 可用工具（自主决定使用）:\n'
        desc += `- **GitHub**: ${state.categories.ai.join(', ')}\n`
      }

      if (state.categories.user.length > 0) {
        desc += '\n## 用户启用工具（按需使用）:\n'
        state.categories.user.forEach((name) => {
          const cat = name.split('_')[0]
          desc += `- **${cat}**: ${name}\n`
        })
      }

      return desc
    },

    // 关闭所有客户端（现在不需要了，但保留接口兼容性）
    close: async () => {
      // 不需要关闭任何客户端
    }
  }
}
