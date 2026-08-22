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
# ⚠ 必须用 NEXT_PUBLIC_ 前缀，否则浏览器端读不到
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
# 用 Supabase 控制台 → Project Settings → API 里的 anon public key（不要用 service_role）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

## Supabase 数据表 & RLS（不做会报 families 表不存在 / RLS 拒绝插入）

在 Supabase → SQL Editor 运行：

```sql
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  family_code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.families enable row level security;
create policy if not exists "families anon select" on public.families for select using (true);
create policy if not exists "families anon insert" on public.families for insert with check (true);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  name text generated always as (title) stored,
  category text not null default '热菜',
  description text,
  cooking_time text,
  prep_time text generated always as (coalesce(cooking_time, '15分钟')) stored,
  difficulty text not null default '简单',
  created_at timestamptz not null default now()
);
alter table public.recipes enable row level security;
create policy if not exists "recipes anon rw" on public.recipes for all using (true) with check (true);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text not null default '适量',
  note text,
  sort_order int not null default 0
);
alter table public.recipe_ingredients enable row level security;
create policy if not exists "recipe_ingredients anon rw" on public.recipe_ingredients for all using (true) with check (true);

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number int not null default 1,
  step int generated always as (step_number) stored,
  title text,
  content text not null,
  tip text
);
alter table public.recipe_steps enable row level security;
create policy if not exists "recipe_steps anon rw" on public.recipe_steps for all using (true) with check (true);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  recipe_id uuid not null,
  recipe_name text not null,
  user_name text not null,
  servings int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists orders_family_created on public.orders(family_id, created_at);
alter table public.orders enable row level security;
create policy if not exists "orders anon rw" on public.orders for all using (true) with check (true);

create table if not exists public.shopping (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'extra',
  name text not null,
  "quantityStr" text not null default '1份',
  checked bool not null default false,
  created_at timestamptz not null default now()
);
alter table public.shopping enable row level security;
create policy if not exists "shopping anon rw" on public.shopping for all using (true) with check (true);
```

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

推荐部署到 [Vercel](https://vercel.com)。部署时需在平台配置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

（前缀不能少；浏览器端只能读取 `NEXT_PUBLIC_*` 变量。）
