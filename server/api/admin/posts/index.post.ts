import jwt from 'jsonwebtoken'
import slugify from 'slugify'
import getPrisma from '../../../../lib/prisma'

async function verifyAuth(event: any) {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '未登录'
    })
  }

  try {
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as any

    if (decoded.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '无权访问'
      })
    }

    return decoded
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token 无效或已过期'
    })
  }
}

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()

  // 验证权限
  const user = await verifyAuth(event)

  const body = await readBody(event)

  // 验证必填字段
  if (!body.title || !body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: '标题和内容不能为空'
    })
  }

  // 生成 slug（中文标题 slugify 会返回空，fallback 用时间戳）
  let slug = slugify(body.title, { lower: true, strict: true })
  if (!slug) {
    slug = `post-${Date.now()}`
  }

  // 检查 slug 是否已存在，如果重复加后缀
  const existing = await prisma.post.findUnique({
    where: { slug }
  })

  if (existing) {
    slug = `${slug}-${Date.now()}`
  }

  // 创建文章
  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || '',
      coverImage: body.coverImage || null,
      published: body.published || false,
      publishedAt: body.published ? new Date() : null,
      authorId: user.userId,
      categoryId: body.categoryId || null,
      tags: body.tags && body.tags.length > 0 ? {
        create: body.tags.map((tagId: string) => ({
          tag: { connect: { id: tagId } }
        }))
      } : undefined
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })

  return {
    success: true,
    data: post
  }
})
