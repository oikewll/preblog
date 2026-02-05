import { marked } from 'marked'
import getPrisma from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug is required'
    })
  }

  const includeRelations = {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true
      }
    },
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    },
    tags: {
      include: {
        tag: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }
  }

  // 先按 slug 查找，找不到就按 id 查找（支持直接用 ID 访问）
  let post = await prisma.post.findUnique({
    where: { slug },
    include: includeRelations
  })

  if (!post) {
    post = await prisma.post.findUnique({
      where: { id: slug },
      include: includeRelations
    })
  }

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post not found'
    })
  }

  // 增加浏览次数
  await prisma.post.update({
    where: { id: post.id },
    data: {
      views: {
        increment: 1
      }
    }
  })

  // 将 markdown 转换为 HTML
  const htmlContent = await marked(post.content)

  return {
    success: true,
    data: { ...post, views: post.views + 1, content: htmlContent }
  }
})
