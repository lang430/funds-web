# 部署上线指南

## 一、准备工作

### 1. Cloudflare 账号
注册 https://dash.cloudflare.com/sign-up

### 2. GitHub OAuth App
1. 访问 https://github.com/settings/developers
2. 创建新的 OAuth App
3. 回调地址：`https://your-app.pages.dev/api/auth/callback`

### 3. 域名（可选）
Cloudflare Pages 提供免费 `*.pages.dev` 域名。

---

## 二、创建 Cloudflare 资源

```bash
# 登录
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create funds-db
# 记录返回的 database_id

# 创建 KV Namespace
npx wrangler kv:namespace create "funds-kv"
# 记录返回的 id

# 初始化数据库（生产环境）
npx wrangler d1 execute funds-db --remote --file=./migrations/0001_initial.sql
```

---

## 三、配置 wrangler.toml

将创建资源时获得的 `database_id` 和 KV `id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "funds-db"
database_id = "your-actual-database-id"

[[kv_namespaces]]
binding = "KV"
id = "your-actual-kv-id"
```

---

## 四、设置环境变量

```bash
# 设置 GitHub OAuth 密钥
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET

# 生成 JWT 密钥（随机字符串）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npx wrangler secret put JWT_SECRET
```

---

## 五、部署

### 方式一：Wrangler CLI 手动部署

```bash
# 构建
pnpm build

# 部署
npx wrangler pages deploy .vercel/output/static
```

### 方式二：GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install

      - run: pnpm build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .vercel/output/static --project-name=funds-web
```

在 GitHub 仓库 Settings > Secrets 中添加：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 方式三：Cloudflare Pages Git 集成

1. Cloudflare Dashboard → Workers & Pages → Create → Pages
2. 连接 GitHub 仓库
3. 构建设置：
   - 构建命令：`pnpm build`
   - 输出目录：`.vercel/output/static`
   - 环境变量：添加 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`JWT_SECRET`

---

## 六、部署后验证

1. 访问部署域名
2. 测试 GitHub 登录
3. 添加基金、查看估值
4. 检查指数数据
5. 验证设置保存
6. 测试导入导出功能

---

## 七、监控

在 Cloudflare Dashboard 查看：
- Workers & Pages → funds-web → Metrics（请求量、错误率）
- D1 → funds-db → Metrics（读写次数、存储量）
- KV → Funds-KV → Metrics（读写次数）
