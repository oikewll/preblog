import jwt from 'jsonwebtoken'
import getPrisma from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在'
      })
    }

    return {
      success: true,
      data: user
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token 无效或已过期'
    })
  }
})
