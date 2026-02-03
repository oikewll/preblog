import jwt from 'jsonwebtoken'
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
  await verifyAuth(event)

  const postId = getRouterParam(event, 'id')

  if (!postId) {
    throw createError({
      statusCode: 400,
      statusMessage: '文章ID不能为空'
    })
  }

  // 获取文章详情
  const post = await prisma.post.findUnique({
    where: { id: postId },
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

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: '文章不存在'
    })
  }

  return {
    success: true,
    data: post
  }
})
