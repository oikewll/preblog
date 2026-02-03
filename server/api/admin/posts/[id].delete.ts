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
      statusMessage: '文章 ID 不能为空'
    })
  }

  // 检查文章是否存在
  const existing = await prisma.post.findUnique({
    where: { id: postId }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: '文章不存在'
    })
  }

  // 删除文章（会级联删除标签关联）
  await prisma.post.delete({
    where: { id: postId }
  })

  return {
    success: true,
    message: '文章已删除'
  }
})
