# Preblog Admin API 参考

Base URL: `http://localhost:3480`（生产环境替换为实际域名）

---

## 认证

### 登录

```
POST /api/auth/login
Content-Type: application/json

Body: { "email": "string", "password": "string" }
```

**响应**：返回 JWT token，同时设置 `auth-token` httpOnly cookie（7d 过期）。

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id", "email", "name", "role", "avatar", "bio" }
  }
}
```

> 后续管理端请求需带 `Cookie: auth-token=<token>` 或直接使用登录返回的 cookie session。

### 当前用户

```
GET /api/auth/me
Cookie: auth-token=<token>
```

### 退出

```
POST /api/auth/logout
Cookie: auth-token=<token>
```

---

## 文章 (Posts)

### 创建文章

```
POST /api/admin/posts
Cookie: auth-token=<ADMIN token>
Content-Type: application/json
```

**Body:**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | ✅ | 文章标题 |
| `content` | string | ✅ | Markdown 正文 |
| `slug` | string | ❌ | 手动指定 URL slug；中文会 fallback 为 `post-<timestamp>` |
| `excerpt` | string | ❌ | 摘要，50-80 字推荐 |
| `coverImage` | string | ❌ | 封面图 URL（先通过 upload 接口获取） |
| `published` | boolean | ❌ | `true` 直接发布，默认 `false`（草稿） |
| `categoryId` | string | ❌ | 分类 ID |
| `tags` | string[] | ❌ | 标签 ID 数组 |

**响应:**

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "title": "...",
    "slug": "...",
    "published": true,
    "publishedAt": "ISO8601",
    "author": { "id", "name", "email" },
    "category": { "id", "name" },
    "tags": [{ "tag": { "id", "name" } }]
  }
}
```

### 获取单篇（管理端）

```
GET /api/admin/posts/:id
Cookie: auth-token=<ADMIN token>
```

### 更新文章

```
PUT /api/admin/posts/:id
Cookie: auth-token=<ADMIN token>
Body: (同创建，部分更新均可)
```

### 删除文章

```
DELETE /api/admin/posts/:id
Cookie: auth-token=<ADMIN token>
```

### 列出文章（管理端）

```
GET /api/admin/posts?page=1&limit=10
Cookie: auth-token=<ADMIN token>
```

---

## 分类 (Categories)

### 列出

```
GET /api/admin/categories
Cookie: auth-token=<ADMIN token>
```

### 创建

```
POST /api/admin/categories
Body: { "name": "string", "slug": "string", "description": "string" }
```

### 更新 / 删除

```
PUT  /api/admin/categories/:id   Body: { name?, slug?, description? }
DELETE /api/admin/categories/:id
```

> 日报分类：`name: "Moltbook日报"`, `slug: "moltbook-daily"`

---

## 标签 (Tags)

### 列出

```
GET /api/admin/tags
Cookie: auth-token=<ADMIN token>
```

### 创建

```
POST /api/admin/tags
Body: { "name": "string", "slug": "string" }
```

### 更新 / 删除

```
PUT  /api/admin/tags/:id   Body: { name?, slug? }
DELETE /api/admin/tags/:id
```

> 日报固定标签：`Moltbook`(slug: `moltbook`), `AI`(slug: `ai`), `Agent`(slug: `agent`), `日报`(slug: `日报`)

---

## 图片上传

```
POST /api/admin/upload
Cookie: auth-token=<ADMIN token>
Content-Type: multipart/form-data

Field: file (image/jpeg | image/png | image/gif | image/webp, max 10MB)
```

**响应：**

```json
{
  "success": true,
  "url": "https://<bucket>.s3.<region>.amazonaws.com/covers/<uuid>.<ext>"
}
```

返回的 `url` 直接传入创建文章时的 `coverImage` 字段。

---

## 公开接口（无需认证）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/posts` | 已发布文章列表 |
| GET | `/api/posts/:slug` | 单篇文章（含 views 计数） |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/tags` | 标签列表 |
