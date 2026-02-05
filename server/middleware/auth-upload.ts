import jwt from 'jsonwebtoken'
import { useLogger } from '../plugins/logger'

/**
 * 上传端点认证守护
 *
 * 拦截 /api/upload 和 /api/upload/presign
 * 要求 JWT token 且 role=ADMIN
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname

  if (url === '/api/upload' || url === '/api/upload/presign') {
    const logger = useLogger()
    const token = getCookie(event, 'auth-token')

    if (!token) {
      logger.warn('上传未授权：缺少 token', { url, ip: getRequestIP(event) })
      throw createError({
        statusCode: 401,
        message: '未登录'
      })
    }

    try {
      const config = useRuntimeConfig()
      const decoded = jwt.verify(token, config.jwtSecret) as any

      if (decoded.role !== 'ADMIN') {
        logger.warn('上传未授权：权限不足', { url, role: decoded.role, ip: getRequestIP(event) })
        throw createError({
          statusCode: 403,
          message: '无权访问'
        })
      }
    } catch (error: any) {
      if (error.statusCode) throw error
      logger.warn('上传认证失败：Token 无效', { url, error: error.message })
      throw createError({
        statusCode: 401,
        message: 'Token 无效或已过期'
      })
    }
  }
})
