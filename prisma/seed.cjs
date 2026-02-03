const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

// Prisma 7 SQLite 需要使用 adapter
const { PrismaSQLite } = require('@prisma/adapter-sqlite')
const adapter = new PrismaSQLite()

const prisma = new PrismaClient({
  adapter
})

async function main() {
  console.log('🌱 开始填充数据库...')

  // 清空现有数据
  await prisma.postTag.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      bio: '网站管理员',
    },
  })
  console.log('✅ 创建管理员用户:', admin.email)

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'User',
      password: userPassword,
      role: 'USER',
      bio: '普通用户',
    },
  })
  console.log('✅ 创建普通用户:', user.email)

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '技术',
        slug: 'tech',
        description: '技术相关文章',
      },
    }),
    prisma.category.create({
      data: {
        name: '生活',
        slug: 'life',
        description: '生活分享',
      },
    }),
    prisma.category.create({
      data: {
        name: '教程',
        slug: 'tutorial',
        description: '教程文章',
      },
    }),
  ])
  console.log('✅ 创建分类:', categories.length, '个')

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Vue', slug: 'vue' } }),
    prisma.tag.create({ data: { name: 'Nuxt', slug: 'nuxt' } }),
    prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.create({ data: { name: 'JavaScript', slug: 'javascript' } }),
    prisma.tag.create({ data: { name: 'CSS', slug: 'css' } }),
    prisma.tag.create({ data: { name: 'Tailwind', slug: 'tailwind' } }),
  ])
  console.log('✅ 创建标签:', tags.length, '个')

  // 创建文章
  const posts = [
    {
      title: 'Nuxt 3 入门教程',
      slug: 'nuxt-3-getting-started',
      content: `# Nuxt 3 入门教程

## 什么是 Nuxt 3？

Nuxt 3 是一个基于 Vue 3 的全栈框架，提供了出色的开发体验。

## 主要特性

- ⚡️ 基于 Vite 的极速热更新
- 🎨 TypeScript 支持
- 🔥 自动导入组件
- 📦 优化的打包体积

## 快速开始

\`\`\`bash
npx nuxi init my-app
cd my-app
npm install
npm run dev
\`\`\`

这样你就创建了第一个 Nuxt 3 项目！`,
      excerpt: '学习如何使用 Nuxt 3 构建现代化的 Web 应用',
      published: true,
      publishedAt: new Date(),
      categoryId: categories[2].id,
      authorId: admin.id,
      tags: [tags[1].id, tags[2].id],
    },
    {
      title: 'TypeScript 最佳实践',
      slug: 'typescript-best-practices',
      content: `# TypeScript 最佳实践

## 为什么使用 TypeScript？

TypeScript 提供了静态类型检查，可以在开发阶段发现错误。

## 最佳实践

### 1. 使用接口定义数据结构

\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
}
\`\`\`

### 2. 避免使用 any

尽量使用具体的类型而不是 any。

### 3. 使用类型守卫

\`\`\`typescript
function isString(value: unknown): value is string {
  return typeof value === 'string'
}
\`\`\``,
      excerpt: 'TypeScript 开发中的最佳实践和技巧',
      published: true,
      publishedAt: new Date(),
      categoryId: categories[0].id,
      authorId: admin.id,
      tags: [tags[2].id, tags[3].id],
    },
    {
      title: 'Tailwind CSS 实用技巧',
      slug: 'tailwind-css-tips',
      content: `# Tailwind CSS 实用技巧

## 什么是 Tailwind CSS？

Tailwind CSS 是一个功能类优先的 CSS 框架。

## 实用技巧

### 1. 使用 @apply 提取组件样式

\`\`\`css
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
}
\`\`\`

### 2. 自定义配置

在 \`tailwind.config.js\` 中自定义主题：

\`\`\`javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
      }
    }
  }
}
\`\`\``,
      excerpt: 'Tailwind CSS 的实用技巧和最佳实践',
      published: true,
      publishedAt: new Date(),
      categoryId: categories[2].id,
      authorId: user.id,
      tags: [tags[4].id, tags[5].id],
    },
    {
      title: '我的编程之路',
      slug: 'my-programming-journey',
      content: `# 我的编程之路

## 开始

我从大学开始接触编程...

## 成长

通过不断学习和实践，我逐渐掌握了多种技术栈。

## 未来

继续深入学习，成为更好的开发者。`,
      excerpt: '分享我的编程学习经历',
      published: true,
      publishedAt: new Date(),
      categoryId: categories[1].id,
      authorId: user.id,
      tags: [],
    },
    {
      title: '草稿文章示例',
      slug: 'draft-post-example',
      content: '这是一篇草稿文章，还未发布。',
      excerpt: '草稿文章',
      published: false,
      categoryId: categories[0].id,
      authorId: admin.id,
      tags: [],
    },
  ]

  for (const postData of posts) {
    const { tags: tagIds, ...postFields } = postData
    const post = await prisma.post.create({
      data: {
        ...postFields,
        tags: {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    })
    console.log('✅ 创建文章:', post.title)
  }

  console.log('🎉 数据填充完成！')
}

main()
  .catch((e) => {
    console.error('❌ 数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
