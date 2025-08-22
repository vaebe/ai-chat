import { experimental_createMCPClient as createMCPClient } from 'ai'
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio'

export async function createGithubSearchMcpServer() {
  const client = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'npx',
      args: [
        '-y',
        '@smithery/cli@latest',
        'run',
        '@smithery-ai/github',
        '--key',
        '7d480ab7-e708-422f-b208-ebae684441c2',
        '--profile',
        'gastric-heron-04D762'
      ]
    })
  })

  const tools = await client.tools()

  return {
    client,
    tools
  }
}

export async function createDuckDuckGoMcpServer() {
  const client = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'npx',
      args: [
        '-y',
        '@smithery/cli@latest',
        'run',
        '@nickclyde/duckduckgo-mcp-server',
        '--key',
        '7d480ab7-e708-422f-b208-ebae684441c2'
      ]
    })
  })

  const tools = await client.tools()
  return {
    client,
    tools
  }
}
