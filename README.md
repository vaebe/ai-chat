# ai-chat

**ai-chat** 是一个使用现代 Web 技术构建的功能完整的 AI 聊天应用程序。它提供了一个对话界面，具备包括网络搜索、GitHub 集成和实时流式响应在内的高级 AI 功能。

## 主要特性

1. **AI 聊天界面**
   - 实时流式聊天响应
   - 对话历史管理
   - 使用 PostgreSQL 数据库持久化消息
   - 对话标题自动生成

2. **AI 模型集成**
   - DeepSeek AI 模型支持
   - 可配置的模型选择
   - 系统提示词自定义

3. **高级 AI 工具**
   - 网络搜索功能（Exa API 集成）
   - GitHub MCP（Model Context Protocol）集成
   - 用于动态工具加载的工具管理系统
   - 自动工具选择和使用

4. **用户管理**
   - Clerk 认证集成
   - 用户会话管理
   - 受保护的 API 路由

5. **UI/UX 特性**
   - 使用 Tailwind CSS 的响应式设计
   - 深色/浅色主题支持
   - 实时消息渲染

6. **性能与安全**
   - 使用 Upstash Redis 进行速率限制
   - Vercel KV 集成
   - API 请求优化
   - 客户端状态管理

7. **开发者特性**
   - TypeScript 类型安全
   - 用于数据库管理的 Prisma ORM
   - ESLint 和 Prettier 代码格式化
   - Git 钩子保证代码质量

## 使用的技术

- **前端框架**: Next.js 15 with App Router
- **语言**: TypeScript
- **样式**: Tailwind CSS with shadcn/ui components
- **状态管理**: Zustand
- **AI SDK**: Vercel AI SDK
- **认证**: Clerk
- **数据库**: PostgreSQL with Prisma ORM
- **缓存**: Vercel KV (Upstash Redis)
- **部署**: Vercel
- **图片存储**: ImageKit
- **APIs**: DeepSeek API, Exa Web Search API, GitHub MCP

## 前置要求

开始之前，请确保您已安装以下软件：

- Node.js (版本 18 或更高)
- pnpm 包管理器
- PostgreSQL 数据库
- 所需服务的账户 (Clerk, Vercel, ImageKit, GitHub, Exa API)

## 设置说明

1. **克隆和设置**

   ```bash
   git clone <repository-url>
   cd ai-chat
   pnpm install
   ```

2. **环境配置**

   ```bash
   cp .env.example .env
   ```

   填写所需的环境变量：
   - 数据库连接 (DATABASE_URL)
   - Clerk 认证密钥
   - Vercel KV 凭据
   - ImageKit 凭据
   - 用于 MCP 集成的 GitHub 令牌
   - 用于网络搜索的 Exa API 密钥

3. **数据库设置**

   ```bash
   # 生成 Prisma 客户端
   npx prisma generate

   # 运行数据库迁移
   npx prisma migrate dev
   ```

4. **开发服务器**

   ```bash
   pnpm run dev
   ```

   应用程序将在 <http://localhost:3000> 可用

## 生产环境部署

1. **构建生产版本**

   ```bash
   pnpm run build
   ```

## 数据库管理

- **重置数据库**: `npx prisma migrate reset`
- **创建新迁移**: `npx prisma migrate dev --name migration_name`
- **生成类型**: `npx prisma generate`

## UI 组件管理

添加新的 shadcn/ui 组件：

```bash
npx shadcn@latest add component-name
```

## 网站图标生成

使用 [RealFaviconGenerator](https://realfavicongenerator.net/) 生成网站图标。

## 测试 MCP 集成

测试 Model Context Protocol 集成：

```bash
npx @modelcontextprotocol/inspector node mcp/githubSearch.mjs
```

## 项目结构

```text
ai-chat/
├── app/                 # Next.js app router
│   ├── ai/             # AI chat interface
│   ├── api/            # API routes
│   ├── sign-in/        # Authentication pages
│   └── sign-up/        # Authentication pages
├── components/         # Shared React components
├── lib/                # Utility functions
├── prisma/             # Database schema and migrations
└── public/             # Static assets
```

## 关键环境变量

| Variable | Description |
|----------|-------------|
| DATABASE_URL | 数据库连接地址 |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk frontend key |
| CLERK_SECRET_KEY | Clerk backend key |
| GITHUB_TOKEN | GitHub token for MCP integration |
| KV_* | Vercel KV (Upstash Redis) credentials |
| NEXT_PUBLIC_IMAGEKIT_* | ImageKit credentials |
