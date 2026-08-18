# 家庭厨房菜谱助手 (kitchen-assistant)

基于 **Next.js 16（App Router）** + **React 19** + **Supabase** + **Tailwind CSS v4** + **TypeScript** 的家庭菜谱管理应用。

线上地址：https://kitchen-assistant-dun.vercel.app/api/recipes

## 功能

- 用户端首页：浏览菜谱列表、新增菜谱
- 后台管理页（`/admin`）：浏览全部菜谱
- 后端 API：基于 Supabase 数据库的菜谱增删改查

## 目录结构

```
kitchen-assistant/
├── app/
│   ├── admin/page.tsx          # 后台管理页
│   ├── api/
│   │   └── recipes/
│   │       ├── route.ts        # GET 列表 / POST 新增
│   │       └── [id]/route.ts   # PUT 更新 / DELETE 删除
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                # 用户端首页
│   └── favicon.ico
├── lib/
│   └── supabase.ts             # Supabase 客户端
├── AGENTS.md                   # Next.js 16 破坏性变更提示
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器，访问 http://localhost:3000
```

## 环境变量

在项目根目录创建 `.env.local`：

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

需要一个 `recipes` 数据表，建议字段：`id`（主键）、`name`、`category`、`created_at`（默认当前时间）。

## 可用脚本

- `npm run dev`：启动开发服务器
- `npm run build`：生产构建
- `npm run start`：运行生产服务
- `npm run lint`：代码检查

## API 说明

| 方法     | 路径                  | 说明         |
| -------- | --------------------- | ------------ |
| `GET`    | `/api/recipes`        | 获取菜谱列表 |
| `POST`   | `/api/recipes`        | 新增菜谱     |
| `PUT`    | `/api/recipes/[id]`   | 更新菜谱     |
| `DELETE` | `/api/recipes/[id]`   | 删除菜谱     |

## 部署

推荐部署到 [Vercel](https://vercel.com)。部署时需在平台配置上述 `SUPABASE_URL` / `SUPABASE_KEY` 环境变量。
