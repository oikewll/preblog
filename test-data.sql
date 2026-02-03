-- 创建管理员用户（密码: admin123）
INSERT INTO users (id, email, name, password, role, bio, createdAt, updatedAt)
VALUES ('admin123', 'admin@example.com', 'Admin', '$2b$10$K8ZjZqZjZjZjZjZjZjZjZuOYxjZjZjZjZjZjZjZjZjZjZjZjZjZj', 'ADMIN', '网站管理员', datetime('now'), datetime('now'));

-- 创建分类
INSERT INTO categories (id, name, slug, description, createdAt, updatedAt)
VALUES
  ('cat1', '技术', 'tech', '技术相关文章', datetime('now'), datetime('now')),
  ('cat2', '生活', 'life', '生活分享', datetime('now'), datetime('now')),
  ('cat3', '教程', 'tutorial', '教程文章', datetime('now'), datetime('now'));

-- 创建标签
INSERT INTO tags (id, name, slug, createdAt, updatedAt)
VALUES
  ('tag1', 'Vue', 'vue', datetime('now'), datetime('now')),
  ('tag2', 'Nuxt', 'nuxt', datetime('now'), datetime('now')),
  ('tag3', 'TypeScript', 'typescript', datetime('now'), datetime('now')),
  ('tag4', 'JavaScript', 'javascript', datetime('now'), datetime('now'));

-- 创建测试文章
INSERT INTO posts (id, title, slug, content, excerpt, published, publishedAt, authorId, categoryId, views, createdAt, updatedAt)
VALUES
  ('post1', '欢迎来到我的博客', 'welcome-to-my-blog', '# 欢迎\n\n这是我的第一篇博客文章。感谢你的访问！', '欢迎来到我的博客', 1, datetime('now'), 'admin123', 'cat1', 0, datetime('now'), datetime('now')),
  ('post2', 'Nuxt 4 入门教程', 'nuxt-4-getting-started', '# Nuxt 4 入门\n\nNuxt 4 是一个强大的 Vue 框架...', '学习 Nuxt 4 的基础知识', 1, datetime('now'), 'admin123', 'cat3', 0, datetime('now'), datetime('now'));

-- 添加文章标签关联
INSERT INTO post_tags (postId, tagId)
VALUES
  ('post2', 'tag1'),
  ('post2', 'tag2');
