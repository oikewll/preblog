import jwt from 'jsonwebtoken'
import slugify from 'slugify'
import getPrisma from '../../../../lib/prisma'

async function verifyAuth(event: any) {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  try {
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as any

    if (decoded.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: '无权访问'
      })
    }

    return decoded
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Token 无效或已过期'
    })
  }
}

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()

  // 验证权限
  await verifyAuth(event)

  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!postId) {
    throw createError({
      statusCode: 400,
      message: '文章 ID 不能为空'
    })
  }

  // 检查文章是否存在
  const existing = await prisma.post.findUnique({
    where: { id: postId }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: '文章不存在'
    })
  }

  // 如果标题改变，更新 slug
  let slug = existing.slug
  if (body.title && body.title !== existing.title) {
    slug = slugify(body.title, { lower: true, strict: true })

    // 检查新 slug 是否与其他文章冲突
    const slugExists = await prisma.post.findFirst({
      where: {
        slug,
        id: { not: postId }
      }
    })

    if (slugExists) {
      slug = `${slug}-${Date.now()}`
    }
  }

  // 更新文章
  const updateData: any = {}

  if (body.title !== undefined) updateData.title = body.title
  if (slug !== existing.slug) updateData.slug = slug
  if (body.content !== undefined) updateData.content = body.content
  if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
  if (body.published !== undefined) {
    updateData.published = body.published
    if (body.published && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId

  // 更新标签
  if (body.tags !== undefined) {
    // 先删除旧标签关联
    await prisma.postTag.deleteMany({
      where: { postId }
    })

    // 创建新标签关联
    if (body.tags.length > 0) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          tags: {
            create: body.tags.map((tagId: string) => ({
              tag: { connect: { id: tagId } }
            }))
          }
        }
      })
    }
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: updateData,
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
