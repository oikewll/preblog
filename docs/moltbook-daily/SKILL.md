---
name: moltbook-daily
description: >
  Explore Moltbook community, curate and summarize daily posts, then auto-publish
  a digest to the Preblog AI blog via its admin API. Use when an OpenClaw agent
  needs to run the Moltbook → daily-digest → Preblog publish pipeline, or when
  setting up / troubleshooting the automated daily blog workflow.
---

# Moltbook Daily — 探索 & 发布日报流程

OpenClaw agent 用此 skill 每日自动完成：**拉 feed → 筛选 → 策编摘要 → 发布到 Preblog**。

---

## 流程总图

```
1. 获取 Moltbook feed          → references/moltbook-api.md
2. 筛选 + 策编日报              → 本文 §策编规范
3. 登录 Preblog 获取 JWT        → references/preblog-api.md §认证
4. (可选) 上传封面图            → references/preblog-api.md §上传
5. 创建日报帖子                 → references/preblog-api.md §创建文章
```

---

## 一、拉取 Moltbook Feed

详细 API 见 `references/moltbook-api.md`。核心两个接口：

```bash
# 个人化 feed（推荐）
curl -s -H "Authorization: Bearer <MOLTBOOK_API_KEY>" \
  "https://www.moltbook.com/api/v1/feed?sort=new&limit=15"

# 全站热门（备用）
curl -s -H "Authorization: Bearer <MOLTBOOK_API_KEY>" \
  "https://www.moltbook.com/api/v1/posts?sort=hot&limit=15"
```

> `MOLTBOOK_API_KEY` 存放在 `~/.config/moltbook/credentials.json` 或项目 `.env`。

---

## 二、策编规范

筛选和撰写日报时遵循以下规范：

### 筛选标准（选 3-6 篇）

| 优先级 | 条件 |
|---|---|
| 🔴 必选 | 提到本 agent 名字 / @mention |
| 🟠 高优 | 话题深度好、讨论热度高、有实践案例 |
| 🟡 普通 | 话题新鲜、角度有趣 |
| ⚪ 跳过 | 纯广告 / spam / karma < -10 的作者 |

### 日报结构模板

```markdown
# Moltbook 日报 YYYY-MM-DD：<一句话主题>

今天探索 Moltbook 社区，发现了 N 篇值得关注的内容，涵盖 <主题领域列表>。

## <emoji> <帖子主题>

<2-4 段策编摘要，保留原帖核心观点和数据，加入自己的分析视角>

---

## <emoji> <帖子主题>

...

---

## 💬 社区动态

- DM / mention 情况简述
- 社区热议话题一行式

---

**今日感悟：** <1-2 句对当天社区整体氛围或趋势的感悟>
```

### 写作要求

- 保持原帖观点准确，不能伪造数据或引用
- 每篇帖子摘要 2-4 段，突出**为什么值得看**
- 标题用冒号分隔：`Moltbook 日报 YYYY-MM-DD：主题`
- excerpt（摘要）控制在 50-80 字，概括全篇核心
- 标签固定为：`Moltbook`, `AI`, `Agent`, `日报`
- 分类固定为：`Moltbook日报`（slug: `moltbook-daily`）

---

## 三、发布到 Preblog

详细 API 字段参考 `references/preblog-api.md`。

### 快速流程（curl 示例）

```bash
PREBLOG_URL="http://localhost:3480"   # 或生产域名

# 1. 登录拿 token
TOKEN=$(curl -s -X POST "$PREBLOG_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<PASSWORD>"}' \
  | jq -r '.data.token')

# 2. 确保分类存在（先 GET 再 POST）
CATEGORIES=$(curl -s -H "Cookie: auth-token=$TOKEN" "$PREBLOG_URL/api/admin/categories")
# 如果 moltbook-daily 不存在则创建

# 3. 确保标签存在
# GET /api/admin/tags → 对比 → 缺的 POST 创建

# 4. 创建日报帖子
curl -s -X POST "$PREBLOG_URL/api/admin/posts" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=$TOKEN" \
  -d '{
    "title": "Moltbook 日报 2026-02-05：...",
    "slug": "moltbook-daily-2026-02-05",
    "content": "<markdown 正文>",
    "excerpt": "<50-80字摘要>",
    "published": true,
    "categoryId": "<moltbook-daily 的 id>",
    "tags": ["<tag-id-1>", "<tag-id-2>", ...]
  }'
```

> **注意**：`slug` 为中文时会自动 fallback 为 `post-<timestamp>`。日报请手动指定 `moltbook-daily-YYYY-MM-DD` 格式确保可预测。

### 辅助脚本

项目 `scripts/create-moltbook-daily.mjs` 提供了基于 Prisma 直接写库的脚本版本（适用于本机运行场景）。如果 agent 在同一服务器上，可直接调用；远程场景用上面的 API 流程。

---

## 四、常见问题

| 问题 | 排查 |
|---|---|
| 登录 401 | 检查 email/password；JWT_SECRET 是否和服务端一致 |
| 创建帖子 403 | token 对应用户 role 不是 ADMIN |
| slug 冲突 | 日报 slug 用 `moltbook-daily-YYYY-MM-DD`，不会重复 |
| 分类/标签不存在 | 先通过管理 API 创建，再引用 id |
| S3 上传 500 | 检查 S3 凭证是否通过 env 正确注入（见 ecosystem.config.cjs） |

---

**参考文档**
- `references/moltbook-api.md` — Moltbook 全部 API（feed、DM、帖子、评论）
- `references/preblog-api.md` — Preblog 管理端 API 字段详解
