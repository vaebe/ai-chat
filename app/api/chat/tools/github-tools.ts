import { tool } from 'ai'
import { z } from 'zod'

// GitHub API 基础 URL
const GITHUB_API_BASE = 'https://api.github.com'

// GitHub API 请求辅助函数
async function githubRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = process.env.GITHUB_TOKEN

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ai-chat-github-tools',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub API Error (${response.status}): ${errorText}`)
  }

  return response.json()
}

// ==================== Commit 相关工具 ====================

export const github_get_commit = tool({
  description: 'Get details for a commit from a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    ref: z.string().describe('The commit SHA, branch name, or tag name')
  }),
  execute: async ({ owner, repo, ref }) => {
    return githubRequest(`/repos/${owner}/${repo}/commits/${ref}`)
  }
})

export const github_list_commits = tool({
  description:
    'Get list of commits of a branch in a GitHub repository. Returns at least 30 results per page by default, but can return more if specified using the perPage parameter (up to 100).',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    sha: z.string().optional().describe('SHA or branch to start listing commits from'),
    path: z.string().optional().describe('Only commits containing this file path'),
    author: z.string().optional().describe('GitHub login or email address by which to filter'),
    since: z.string().optional().describe('Only commits after this ISO 8601 timestamp'),
    until: z.string().optional().describe('Only commits before this ISO 8601 timestamp'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)')
  }),
  execute: async ({ owner, repo, sha, path, author, since, until, perPage }) => {
    const params = new URLSearchParams()
    if (sha) params.append('sha', sha)
    if (path) params.append('path', path)
    if (author) params.append('author', author)
    if (since) params.append('since', since)
    if (until) params.append('until', until)
    if (perPage) params.append('per_page', perPage.toString())

    const query = params.toString()
    return githubRequest(`/repos/${owner}/${repo}/commits${query ? `?${query}` : ''}`)
  }
})

// ==================== File 相关工具 ====================

export const github_get_file_contents = tool({
  description: 'Get the contents of a file or directory from a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    path: z.string().describe('The file path or directory path'),
    ref: z.string().optional().describe('The name of the commit/branch/tag')
  }),
  execute: async ({ owner, repo, path, ref }) => {
    const params = ref ? `?ref=${encodeURIComponent(ref)}` : ''
    return githubRequest(`/repos/${owner}/${repo}/contents/${path}${params}`)
  }
})

// ==================== Label 相关工具 ====================

export const github_get_label = tool({
  description: 'Get a specific label from a repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization name)'),
    repo: z.string().describe('Repository name'),
    name: z.string().describe('Label name')
  }),
  execute: async ({ owner, repo, name }) => {
    return githubRequest(`/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`)
  }
})

// ==================== Release 相关工具 ====================

export const github_get_latest_release = tool({
  description: 'Get the latest release in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name')
  }),
  execute: async ({ owner, repo }) => {
    return githubRequest(`/repos/${owner}/${repo}/releases/latest`)
  }
})

export const github_get_release_by_tag = tool({
  description: 'Get a specific release by its tag name in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    tag: z.string().describe('The tag name')
  }),
  execute: async ({ owner, repo, tag }) => {
    return githubRequest(`/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`)
  }
})

export const github_list_releases = tool({
  description: 'List releases in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination')
  }),
  execute: async ({ owner, repo, perPage, page }) => {
    const params = new URLSearchParams()
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())

    const query = params.toString()
    return githubRequest(`/repos/${owner}/${repo}/releases${query ? `?${query}` : ''}`)
  }
})

// ==================== Tag 相关工具 ====================

export const github_get_tag = tool({
  description: 'Get details about a specific git tag in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    tagSha: z.string().describe('The tag SHA')
  }),
  execute: async ({ owner, repo, tagSha }) => {
    return githubRequest(`/repos/${owner}/${repo}/git/tags/${tagSha}`)
  }
})

export const github_list_tags = tool({
  description: 'List git tags in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination')
  }),
  execute: async ({ owner, repo, perPage, page }) => {
    const params = new URLSearchParams()
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())

    const query = params.toString()
    return githubRequest(`/repos/${owner}/${repo}/tags${query ? `?${query}` : ''}`)
  }
})

// ==================== User 相关工具 ====================

export const github_get_me = tool({
  description:
    "Get details of the authenticated GitHub user. Use this when a request is about the user's own profile for GitHub. Or when information is missing to build other tool calls.",
  inputSchema: z.object({}),
  execute: async () => {
    return githubRequest('/user')
  }
})

export const github_search_users = tool({
  description:
    'Find GitHub users by username, real name, or other profile information. Useful for locating developers, contributors, or team members.',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "username", "location:san francisco", "language:python")'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    sort: z.enum(['followers', 'repositories', 'joined']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order')
  }),
  execute: async ({ query, perPage, page, sort, order }) => {
    const params = new URLSearchParams()
    params.append('q', query)
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())
    if (sort) params.append('sort', sort)
    if (order) params.append('order', order)

    return githubRequest(`/search/users?${params.toString()}`)
  }
})

// ==================== Issue 相关工具 ====================

export const github_issue_read = tool({
  description: 'Get information about a specific issue in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('The owner of the repository'),
    repo: z.string().describe('The name of the repository'),
    issue_number: z.number().describe('The number of the issue'),
    method: z
      .enum(['get', 'get_comments', 'get_sub_issues', 'get_labels'])
      .describe(
        'The read operation to perform on a single issue. Options: get - Get details of a specific issue; get_comments - Get issue comments; get_sub_issues - Get sub-issues of the issue; get_labels - Get labels assigned to the issue'
      ),
    page: z.number().min(1).optional().describe('Page number for pagination (min 1)'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page for pagination (min 1, max 100)')
  }),
  execute: async ({ owner, repo, issue_number, method, page, perPage }) => {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())

    const query = params.toString()

    switch (method) {
      case 'get':
        return githubRequest(`/repos/${owner}/${repo}/issues/${issue_number}`)
      case 'get_comments':
        return githubRequest(`/repos/${owner}/${repo}/issues/${issue_number}/comments${query ? `?${query}` : ''}`)
      case 'get_sub_issues':
        // GitHub API doesn't have a direct endpoint for sub-issues, this would need to be implemented differently
        throw new Error('Sub-issues are not supported by the GitHub REST API')
      case 'get_labels':
        return githubRequest(`/repos/${owner}/${repo}/issues/${issue_number}/labels${query ? `?${query}` : ''}`)
      default:
        throw new Error(`Unknown method: ${method}`)
    }
  }
})

export const github_list_issues = tool({
  description: 'List issues in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    state: z
      .enum(['open', 'closed', 'all'])
      .optional()
      .describe('Filter by state, by default both open and closed issues are returned when not provided'),
    labels: z.array(z.string()).optional().describe('Filter by labels'),
    since: z.string().optional().describe('Filter by date (ISO 8601 timestamp)'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page for pagination (min 1, max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    orderBy: z.enum(['created', 'updated', 'comments']).optional().describe('Order issues by field'),
    direction: z.enum(['asc', 'desc']).optional().describe('Order direction')
  }),
  execute: async ({ owner, repo, state, labels, since, perPage, page, orderBy, direction }) => {
    const params = new URLSearchParams()
    if (state) params.append('state', state)
    if (labels) params.append('labels', labels.join(','))
    if (since) params.append('since', since)
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())
    if (orderBy) params.append('sort', orderBy)
    if (direction) params.append('direction', direction)

    return githubRequest(`/repos/${owner}/${repo}/issues?${params.toString()}`)
  }
})

export const github_list_issue_types = tool({
  description: 'List supported issue types for repository owner (organization)',
  inputSchema: z.object({
    owner: z.string().describe('The organization owner of the repository')
  }),
  execute: async ({ owner }) => {
    // This requires GraphQL API as REST API doesn't have this endpoint
    // For now, we'll return a placeholder response
    return {
      message: `Issue types are organization-specific for ${owner} and require GraphQL API access`,
      available_types: ['issue', 'bug', 'enhancement', 'documentation', 'duplicate']
    }
  }
})

export const github_search_issues = tool({
  description: 'Search for issues in GitHub repositories using issues search syntax already scoped to is:issue',
  inputSchema: z.object({
    query: z.string().describe('Search query using GitHub issues search syntax (automatically scoped to is:issue)'),
    owner: z
      .string()
      .optional()
      .describe('Optional repository owner. If provided with repo, only issues for this repository are listed'),
    repo: z
      .string()
      .optional()
      .describe('Optional repository name. If provided with owner, only issues for this repository are listed'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    sort: z
      .enum(['comments', 'created', 'updated'])
      .optional()
      .describe('Sort field by number of matches of categories, defaults to best match'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order')
  }),
  execute: async ({ query, owner, repo, perPage, page, sort, order }) => {
    const params = new URLSearchParams()
    let searchQuery = query

    // Automatically scope to issues
    if (!searchQuery.includes('is:')) {
      searchQuery += ' is:issue'
    }

    // Add repo qualifier if owner and repo are provided
    if (owner && repo) {
      searchQuery += ` repo:${owner}/${repo}`
    }

    params.append('q', searchQuery)
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())
    if (sort) params.append('sort', sort)
    if (order) params.append('order', order)

    return githubRequest(`/search/issues?${params.toString()}`)
  }
})

// ==================== Branch 相关工具 ====================

export const github_list_branches = tool({
  description: 'List branches in a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    protected: z.boolean().optional().describe('Setting to true returns only protected branches'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination')
  }),
  execute: async ({ owner, repo, protected: isProtected, perPage, page }) => {
    const params = new URLSearchParams()
    if (isProtected !== undefined) params.append('protected', isProtected.toString())
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())

    const query = params.toString()
    return githubRequest(`/repos/${owner}/${repo}/branches${query ? `?${query}` : ''}`)
  }
})

// ==================== Pull Request 相关工具 ====================

export const github_pull_request_read = tool({
  description: 'Get information on a specific pull request in GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    pull_number: z.number().describe('The number of the pull request'),
    method: z
      .enum(['get', 'get_comments', 'get_commits', 'get_files'])
      .describe(
        'The read operation to perform on a single pull request. Options: get - Get details of a specific pull request; get_comments - Get pull request comments; get_commits - Get pull request commits; get_files - Get pull request files'
      ),
    page: z.number().min(1).optional().describe('Page number for pagination (min 1)'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page for pagination (min 1, max 100)')
  }),
  execute: async ({ owner, repo, pull_number, method, page, perPage }) => {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())

    const query = params.toString()

    switch (method) {
      case 'get':
        return githubRequest(`/repos/${owner}/${repo}/pulls/${pull_number}`)
      case 'get_comments':
        return githubRequest(`/repos/${owner}/${repo}/pulls/${pull_number}/comments${query ? `?${query}` : ''}`)
      case 'get_commits':
        return githubRequest(`/repos/${owner}/${repo}/pulls/${pull_number}/commits${query ? `?${query}` : ''}`)
      case 'get_files':
        return githubRequest(`/repos/${owner}/${repo}/pulls/${pull_number}/files${query ? `?${query}` : ''}`)
      default:
        throw new Error(`Unknown method: ${method}`)
    }
  }
})

export const github_search_pull_requests = tool({
  description: 'Search for pull requests in GitHub repositories using issues search syntax already scoped to is:pr',
  inputSchema: z.object({
    query: z.string().describe('Search query using GitHub pull requests search syntax (automatically scoped to is:pr)'),
    owner: z
      .string()
      .optional()
      .describe('Optional repository owner. If provided with repo, only pull requests for this repository are listed'),
    repo: z
      .string()
      .optional()
      .describe('Optional repository name. If provided with owner, only pull requests for this repository are listed'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    sort: z
      .enum(['comments', 'created', 'updated'])
      .optional()
      .describe('Sort field by number of matches of categories, defaults to best match'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order')
  }),
  execute: async ({ query, owner, repo, perPage, page, sort, order }) => {
    const params = new URLSearchParams()
    let searchQuery = query

    // Automatically scope to pull requests
    if (!searchQuery.includes('is:')) {
      searchQuery += ' is:pr'
    }

    // Add repo qualifier if owner and repo are provided
    if (owner && repo) {
      searchQuery += ` repo:${owner}/${repo}`
    }

    params.append('q', searchQuery)
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())
    if (sort) params.append('sort', sort)
    if (order) params.append('order', order)

    return githubRequest(`/search/issues?${params.toString()}`)
  }
})

// ==================== Repository 相关工具 ====================

export const github_search_repositories = tool({
  description:
    'Find GitHub repositories by name, description, readme, topics, or other metadata. Perfect for discovering projects, finding examples, or locating specific repositories across GitHub.',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "react", "topic:javascript", "language:typescript stars:>1000")'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    sort: z.enum(['stars', 'forks', 'help-wanted-issues', 'updated']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order')
  }),
  execute: async ({ query, perPage, page, sort, order }) => {
    const params = new URLSearchParams()
    params.append('q', query)
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())
    if (sort) params.append('sort', sort)
    if (order) params.append('order', order)

    return githubRequest(`/search/repositories?${params.toString()}`)
  }
})

// ==================== Code 相关工具 ====================

export const github_search_code = tool({
  description:
    "Fast and precise code search across ALL GitHub repositories using GitHub's native search engine. Best for finding exact symbols, functions, classes, or specific code patterns.",
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "function_name", "class:MyClass", "language:javascript")'),
    owner: z.string().optional().describe('Optional repository owner to scope search'),
    repo: z.string().optional().describe('Optional repository name to scope search'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (max 100)'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    sort: z.enum(['indexed']).optional().describe('Sort field')
  }),
  execute: async ({ query, owner, repo, perPage, page, sort }) => {
    const params = new URLSearchParams()
    let searchQuery = query

    // Add repo qualifier if owner and repo are provided
    if (owner && repo) {
      searchQuery += ` repo:${owner}/${repo}`
    }

    params.append('q', searchQuery)
    if (perPage) params.append('per_page', perPage.toString())
    if (page) params.append('page', page.toString())
    if (sort) params.append('sort', sort)

    return githubRequest(`/search/code?${params.toString()}`)
  }
})

// 导出所有工具
export const githubTools = {
  github_get_commit,
  github_list_commits,
  github_get_file_contents,
  github_get_label,
  github_get_latest_release,
  github_get_release_by_tag,
  github_list_releases,
  github_get_tag,
  github_list_tags,
  github_get_me,
  github_search_users,
  github_issue_read,
  github_list_issues,
  github_list_issue_types,
  github_search_issues,
  github_list_branches,
  github_pull_request_read,
  github_search_pull_requests,
  github_search_repositories,
  github_search_code
}
