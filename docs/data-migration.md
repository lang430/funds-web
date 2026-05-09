# 数据迁移说明

## 一、数据库初始化

### 1. 创建 D1 数据库

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create funds-db
```

获取返回的 database_id，填入 `wrangler.toml` 的 `[[d1_databases]]` 配置。

### 2. 执行建表语句

```bash
# 本地开发环境
npx wrangler d1 execute funds-db --local --file=./migrations/0001_initial.sql

# 生产环境
npx wrangler d1 execute funds-db --remote --file=./migrations/0001_initial.sql
```

### 3. 创建 KV Namespace

```bash
npx wrangler kv:namespace create "funds-kv"
```

获取返回的 id，填入 `wrangler.toml` 的 `[[kv_namespaces]]` 配置。

---

## 二、从原扩展迁移数据

原 Chrome 扩展使用 `chrome.storage.sync` 存储数据，格式如下：

```json
{
  "fundListM": [
    { "code": "001618", "num": 1000, "cost": "1.5000" },
    { "code": "110022", "num": 500, "cost": "2.3456" }
  ],
  "fundList": ["001618", "110022"],
  "seciList": ["1.000001", "1.000300", "0.399001", "0.399006"],
  "darkMode": true,
  "showAmount": true,
  "showGains": true,
  "showCost": true,
  "showCostRate": false,
  "showGSZ": false,
  "normalFontSize": false,
  "showBadge": 1,
  "BadgeContent": 1,
  "BadgeType": 1,
  "grayscaleValue": 0,
  "opacityValue": 0
}
```

### 导出步骤

1. 在原扩展中进入设置页面
2. 点击「导出配置文件」，下载 JSON 文件
3. 或点击「导入导出文本」，复制文本内容

### 迁移到 Web 应用

Web 应用启动后，在设置页使用「导入配置文件」功能：
1. 进入「/settings」设置页
2. 点击「导入配置文件」
3. 选择导出的 JSON 文件
4. 系统会自动解析 fundListM 并写入 D1 数据库

### Excel 导入

同样支持从设置页导入 Excel：
| 基金代码 | 持有份额 | 成本价 |
|---------|---------|--------|
| 001618  | 1000    | 1.5    |
| 110022  | 500     | 2.3456 |

---

## 三、环境变量配置

在 `wrangler.toml` 或 Cloudflare Dashboard 设置以下环境变量：

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| GITHUB_CLIENT_ID | GitHub OAuth App Client ID | https://github.com/settings/developers |
| GITHUB_CLIENT_SECRET | GitHub OAuth App Client Secret | 同上 |
| JWT_SECRET | JWT 签名密钥（随机字符串） | 自行生成 |

GitHub OAuth App 回调地址：
- 开发：`http://localhost:3000/api/auth/callback`
- 生产：`https://your-domain.com/api/auth/callback`
