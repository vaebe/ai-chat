# ai-chat

使用 nextjs、ai-sdk 开发的 AI 对话页面

## 启动项目

执行 `pnpm run dev 启动项目`

## prisma

prisma 仅支持 `.env` 文件配置的环境变量

生成数据库迁移

```bash
npx prisma migrate dev --name update_string_fields
```

生成 ts 类型

```bash
npx prisma generate

# 生产环境

npx prisma generate --no-engine
```

## ui

添加组件

```bash
npx shadcn@latest add scroll-area
```

## favicon 配置生成

[猛击直达](https://realfavicongenerator.net/)
