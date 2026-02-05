import jwt from 'jsonwebtoken'
import getPrisma from '../../../lib/prisma'
import { useLogger } from '../../plugins/logger'

export default defineEventHandler(async (event) => {
  const logger = useLogger()
  const prisma = getPrisma()
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
      logger.warn('Token 有效但用户不存在', { userId: decoded.userId })
      throw createError({
        statusCode: 401,
        message: '用户不存在'
      })
    }

    return {
      success: true,
      data: user
    }
  } catch (error: any) {
    if (error.statusCode) throw error // 已是 HttpError，直接抛出
    logger.warn('Token 验证失败', { error: error.message, ip: getRequestIP(event) })
    throw createError({
      statusCode: 401,
      message: 'Token 无效或已过期'
    })
  }
})
