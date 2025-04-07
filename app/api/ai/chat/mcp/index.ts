import { experimental_createMCPClient as createMCPClient } from 'ai'
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio'

export async function createGithubSearchMcpServer() {
  const client = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'npx',
      args: ['-y', '@vaebe/server-github-search'],
      env: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? ''
      }
    })
  })

  const tools = await client.tools()

  return {
    client,
    tools
  }
}
