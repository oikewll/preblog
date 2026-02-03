const Database = require('better-sqlite3')
const bcrypt = require('bcrypt')

const db = new Database('./dev.db')

async function seed() {
  console.log('开始填充测试数据...')

  // 1. 创建用户
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, password, role, bio, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run('user-admin-001', 'admin@example.com', 'Admin', adminPassword, 'ADMIN', '网站管理员')

  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, password, role, bio, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run('user-editor-001', 'editor@example.com', 'Editor', userPassword, 'USER', '内容编辑')

  console.log('✅ 用户创建成功')

  // 2. 创建分类
  const categories = [
    { id: 'cat-001', name: '技术', slug: 'tech', description: '技术相关文章' },
    { id: 'cat-002', name: '生活', slug: 'life', description: '生活分享' },
    { id: 'cat-003', name: '教程', slug: 'tutorial', description: '教程文章' }
  ]

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `)

  categories.forEach(cat => {
    insertCategory.run(cat.id, cat.name, cat.slug, cat.description)
  })

  console.log('✅ 分类创建成功')

  // 3. 创建标签
  const tags = [
    { id: 'tag-001', name: 'Vue', slug: 'vue' },
    { id: 'tag-002', name: 'Nuxt', slug: 'nuxt' },
    { id: 'tag-003', name: 'TypeScript', slug: 'typescript' },
    { id: 'tag-004', name: 'JavaScript', slug: 'javascript' },
    { id: 'tag-005', name: 'CSS', slug: 'css' },
    { id: 'tag-006', name: 'Tailwind', slug: 'tailwind' }
  ]

  const insertTag = db.prepare(`
    INSERT OR IGNORE INTO tags (id, name, slug, createdAt, updatedAt)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `)

  tags.forEach(tag => {
    insertTag.run(tag.id, tag.name, tag.slug)
  })

  console.log('✅ 标签创建成功')

  // 4. 创建文章
  const posts = [
    {
      id: 'post-001',
      title: '欢迎来到我的博客',
      slug: 'welcome-to-my-blog',
      content: '# 欢迎来到我的博客\n\n这是我的第一篇博客文章。感谢你的访问！',
      excerpt: '欢迎来到我的博客，这里分享技术和生活',
      published: 1,
      categoryId: 'cat-001'
    },
    {
      id: 'post-002',
      title: 'Nuxt 4 入门教程',
      slug: 'nuxt-4-getting-started',
      content: '# Nuxt 4 入门教程\n\nNuxt 4 是一个基于 Vue 3 的全栈框架。',
      excerpt: '学习如何使用 Nuxt 4 构建现代化的 Web 应用',
      published: 1,
      categoryId: 'cat-003'
    },
    {
      id: 'post-003',
      title: 'TypeScript 最佳实践',
      slug: 'typescript-best-practices',
      content: '# TypeScript 最佳实践\n\nTypeScript 提供了静态类型检查。',
      excerpt: 'TypeScript 开发中的最佳实践和技巧',
      published: 1,
      categoryId: 'cat-003'
    }
  ]

  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO posts (id, title, slug, content, excerpt, published, publishedAt, authorId, categoryId, views, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, 0, datetime('now'), datetime('now'))
  `)

  posts.forEach(post => {
    insertPost.run(post.id, post.title, post.slug, post.content, post.excerpt, post.published, 'user-admin-001', post.categoryId)
  })

  console.log('✅ 文章创建成功')

  // 5. 添加文章标签关联
  const postTags = [
    { postId: 'post-002', tagId: 'tag-001' },
    { postId: 'post-002', tagId: 'tag-002' },
    { postId: 'post-003', tagId: 'tag-003' }
  ]

  const insertPostTag = db.prepare(`
    INSERT OR IGNORE INTO post_tags (postId, tagId)
    VALUES (?, ?)
  `)

  postTags.forEach(pt => {
    insertPostTag.run(pt.postId, pt.tagId)
  })

  console.log('✅ 文章标签关联创建成功')
  console.log('')
  console.log('🎉 测试数据填充完成！')
  console.log('')
  console.log('登录信息：')
  console.log('管理员: admin@example.com / admin123')
  console.log('编辑: editor@example.com / user123')
  console.log('')
  console.log('访问管理后台: http://localhost:3000/admin/login')

  db.close()
}

seed().catch(console.error)
