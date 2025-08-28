# ai-chat

1. 使用 [nextjs](https://nextjs.org/)、[ai sdk](https://ai-sdk.dev/) 开发的 AI 对话页面
2. 使用 [clerk](https://clerk.com/) 验证身份

## 启动项目

1. 执行 `cp .env.example .env` 创建 env 文件按照说明添加对应的环境变量
2. 执行 `pnpm run dev 启动项目`

## prisma

prisma 仅支持 `.env` 文件配置的环境变量

### 生成数据库迁移

```bash
npx prisma migrate dev --name update_string_fields
```

### 生成 ts 类型

```bash
npx prisma generate

# 生产环境

npx prisma generate --no-engine
```

## ui

添加组件 `npx shadcn@latest add scroll-area`

## favicon 配置生成

[猛击直达](https://realfavicongenerator.net/)

## 测试 mcp

```bash
npx @modelcontextprotocol/inspector node mcp/githubSearch.mjs
```

## todo

1. 重新生成对话后，ai 消息存储了两条
