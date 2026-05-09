# 本地调试指南

## 环境要求

- Node.js >= 18
- pnpm >= 8
- Wrangler CLI (`pnpm add -g wrangler`)

## 快速开始

```bash
# 1. 克隆项目
cd funds-web

# 2. 安装依赖
pnpm install

# 3. 初始化本地 D1 数据库
npx wrangler d1 execute funds-db --local --file=./migrations/0001_initial.sql

# 4. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

## 本地调试模式

开发模式下会自动调用 `setupDevPlatform()` 加载 Cloudflare 绑定（D1、KV）。

如需测试完整的 Cloudflare Workers 环境：

```bash
# 构建
pnpm build

# 使用 wrangler 本地预览
npx wrangler pages dev .vercel/output/static
```

## 常见问题

### 1. 登录失败 / 无法连接 GitHub OAuth
- 检查 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 是否设置
- 开发环境下 GitHub OAuth 回调地址需为 `http://localhost:3000/api/auth/callback`

### 2. D1 数据库错误
- 确认已执行 `wrangler d1 execute --local`
- 检查 `wrangler.toml` 中 `database_id` 是否正确

### 3. KV 缓存错误
- 确认已创建 KV namespace
- KV 写入失败不影响主流程（有 fallback）

### 4. eastmoney API 返回错误
- 基金市场接口在非交易日可能返回空数据
- 节假日判断依赖 `holiday.json`，确保网络可访问 `x2rr.github.io`

### 5. 页面样式错乱
- 清除浏览器缓存
- 确认 Tailwind CSS 已正确编译
- 检查 `globals.css` 中的 `@import "tailwindcss"` 是否存在
