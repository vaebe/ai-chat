# AI Chat 项目开发指南

这是一个基于 Next.js 和 AI SDK 开发的 AI 对话应用。本文档旨在帮助 AI 代码助手快速理解项目结构和开发约定。

## 项目架构

### 核心技术栈

- Next.js 15.2.0 (App Router)
- Prisma (PostgreSQL)
- NextAuth v5 Beta
- AI SDK (@ai-sdk/openai, @ai-sdk/react)
- TailwindCSS + shadcn/ui

### 目录结构

- `/app` - Next.js App Router 路由和页面
  - `/ai` - AI 对话相关页面和组件
  - `/actions` - Server Actions
  - `/api` - API 路由
- `/prisma` - 数据库模型和迁移
- `/components` - 共享组件
- `/lib` - 工具函数和通用逻辑
- `/types` - TypeScript 类型定义

## 关键工作流程

### 开发

```bash
pnpm run dev  # 使用 Turbopack 启动开发服务器
pnpm run lint # ESLint 检查
pnpm format   # Prettier 格式化
```

### 数据库操作

- Prisma 仅支持 `.env` 文件中的环境变量配置
- 数据库迁移：`npx prisma migrate dev --name <migration_name>`
- 生成类型：
  - 开发环境：`npx prisma generate`
  - 生产环境：`npx prisma generate --no-engine`

### UI 组件

使用 shadcn/ui，添加新组件：

```bash
npx shadcn@latest add <component-name>
```

## 项目特定约定

### AI 对话实现

- 使用 AI SDK 进行对话管理
- 对话内容持久化到数据库
- 支持 Model Context Protocol (MCP) 工具集成

### 认证系统

- 基于 NextAuth v5 实现
- 支持多种认证方式，包括 WebAuthn
- 用户信息存储在 PostgreSQL 中

### 速率限制

使用 @upstash/ratelimit 和 Vercel KV 实现 API 调用限制

### Markdown 渲染

支持扩展功能：

- LaTeX 公式 (KaTeX)
- 语法高亮
- GitHub Flavored Markdown

## 集成点

- 数据库：PostgreSQL（通过 Prisma 访问）
- 身份验证：NextAuth
- KV 存储：Vercel KV
- AI 服务：OpenAI（通过 AI SDK）
- 图片托管：ImageKit

## 待办事项

- [ ] 用户消息数据库持久化

_注：本文档反映了当前代码库的实际实践。如需更新或澄清，请创建 PR。_
