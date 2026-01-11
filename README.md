# ai-chat

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**ai-chat** 是一个功能完整的现代化 AI 聊天应用程序，采用 Next.js 16、React 19、TypeScript 5.7 和最新的 AI 技术构建。它提供了流畅的对话界面，支持实时流式响应、网络搜索、GitHub 集成等高级功能。

## ✨ 主要特性

### 🤖 AI 聊天体验

- **实时流式响应** - 基于 Vercel AI SDK 的流式传输，提供流畅的对话体验
- **对话历史管理** - 完整的对话持久化和历史记录管理
- **智能标题生成** - 自动为对话生成有意义的标题

### 🛠️ 高级工具集成

- **网络搜索** - 集成 Exa API，实现实时网络搜索能力
- **GitHub 集成** - 通过 MCP (Model Context Protocol) 实现 GitHub 仓库搜索和代码分析
- **动态工具系统** - 灵活的工具管理系统，支持自动工具选择和使用

### 👤 用户认证与管理

- **Clerk 认证** - 安全的用户认证和会话管理
- **受保护路由** - API 路由的访问控制
- **用户会话** - 完整的用户会话生命周期管理

### 🎨 现代化 UI/UX

- **响应式设计** - 基于 Tailwind CSS 的移动优先设计
- **主题切换** - 支持深色/浅色主题切换
- **实时消息渲染** - 流畅的消息展示和更新
- **shadcn/ui 组件** - 使用高质量的可复用 UI 组件

### ⚡ 性能与安全

- **请求优化** - 智能的 API 请求缓存和优化
- **状态管理** - 使用 Zustand 进行高效的客户端状态管理

### 🔧 开发者友好

- **TypeScript** - 完整的类型安全保障
- **Prisma ORM** - 类型安全的数据库操作
- **代码规范** - ESLint 和 Prettier 配置
- **Git Hooks** - 自动化的代码质量检查

## 🚀 技术栈

| 类别         | 技术                       |
| ------------ | -------------------------- |
| **前端框架** | Next.js 16 (App Router)    |
| **UI 框架**  | React 19.2                 |
| **编程语言** | TypeScript 5.7             |
| **样式方案** | Tailwind CSS 4 + shadcn/ui |
| **状态管理** | Zustand                    |
| **AI SDK**   | Vercel AI SDK              |
| **用户认证** | Clerk                      |
| **数据库**   | PostgreSQL + Prisma ORM    |
| **部署平台** | Vercel                     |

## 📋 前置要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** 数据库实例
- 以下服务的账户：
  - [Clerk](https://clerk.com/) - 用户认证
  - [Vercel](https://vercel.com/) - 部署
  - [GitHub](https://github.com/) - MCP 集成
  - [Exa API](https://exa.ai/) - 网络搜索

## 🎯 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/vaebe/ai-chat.git
cd ai-chat
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

复制环境变量模板并填写必要的信息：

```bash
cp .env.example .env
```

需要配置的环境变量：

```env
# 站点配置 - dev 模式下设置
NEXT_PUBLIC_SITE_URL=""

# 数据库配置
DATABASE_URL="postgresql://user:password@host:port/database"

# GitHub MCP 配置
GITHUB_TOKEN="your_github_personal_access_token"

# Vercel AI Gateway 配置
AI_GATEWAY_API_KEY="your_ai_gateway_api_key"

# DeepSeek AI 配置
DEEPSEEK_API_KEY="your_deepseek_api_key"

# Clerk 用户认证服务
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_UP_URL=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL=""
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=""
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=""
```

### 4. 数据库初始化

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev
```

### 5. 启动开发服务器

```bash
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 数据库管理

```bash
# 重置数据库（删除所有数据）
npx prisma migrate reset

# 创建新的数据库迁移
npx prisma migrate dev --name migration_name

# 生成 Prisma Client 类型
npx prisma generate
```

## 🎨 UI 组件管理

添加新的 shadcn/ui 组件：

```bash
npx shadcn@latest add button
```

## 🔧 开发工具

### 测试 MCP 集成

```bash
npx @modelcontextprotocol/inspector node mcp/githubSearch.mjs
```

### 生成网站图标

使用 [RealFaviconGenerator](https://realfavicongenerator.net/) 生成完整的网站图标包。

## 📁 项目结构

```
ai-chat/
├── app/                      # Next.js App Router
│   ├── ai/                   # AI 聊天界面
│   │   ├── components/       # AI 相关组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   └── store/            # Zustand 状态管理
│   ├── api/                  # API 路由
│   │   └── chat/             # 聊天 API
│   ├── sign-in/              # 登录页面
│   └── sign-up/              # 注册页面
├── components/               # 共享组件
│   ├── ai-elements/          # AI 元素组件
│   └── ui/                   # shadcn/ui 组件
├── lib/                      # 工具函数
├── prisma/                   # Prisma 配置和迁移
├── public/                   # 静态资源
└── types/                    # TypeScript 类型定义
```

## 🔑 环境变量说明

| 变量名                                            | 说明                         | 必需 |
| ------------------------------------------------- | ---------------------------- | ---- |
| `NEXT_PUBLIC_SITE_URL`                            | 站点 URL（开发模式配置）     | ✅   |
| `DATABASE_URL`                                    | PostgreSQL 数据库连接字符串  | ✅   |
| `GITHUB_TOKEN`                                    | GitHub Personal Access Token | ✅   |
| `AI_GATEWAY_API_KEY`                              | Vercel AI Gateway API 密钥   | ✅   |
| `DEEPSEEK_API_KEY`                                | DeepSeek AI API 密钥         | ✅   |
| `EXA_API_KEY`                                     | Exa Web Search API 密钥      | ✅   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Clerk 前端密钥               | ✅   |
| `CLERK_SECRET_KEY`                                | Clerk 后端密钥               | ✅   |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | Clerk 注册页面 URL           | ✅   |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | Clerk 登录页面 URL           | ✅   |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Clerk 注册失败重定向 URL     | ✅   |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Clerk 登录失败重定向 URL     | ✅   |

## 🚢 生产部署

### 构建生产版本

```bash
pnpm run build
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/vaebe/ai-chat/issues)
- 发起 [Pull Request](https://github.com/vaebe/ai-chat/pulls)

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Clerk](https://clerk.com/)
- [Prisma](https://www.prisma.io/)
- [DeepSeek](https://www.deepseek.com/)
