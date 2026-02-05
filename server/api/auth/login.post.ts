import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import getPrisma from '../../../lib/prisma'
import { useLogger } from '../../plugins/logger'

export default defineEventHandler(async (event) => {
  const logger = useLogger()
  const prisma = getPrisma()
  const body = await readBody(event)

  const { email, password } = body

  // 验证输入
  if (!email || !password) {
    logger.warn('登录尝试：缺少必填字段', { ip: getRequestIP(event) })
    throw createError({
      statusCode: 400,
      message: '邮箱和密码不能为空'
    })
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    logger.warn('登录失败：用户不存在', { email, ip: getRequestIP(event) })
    throw createError({
      statusCode: 401,
      message: '邮箱或密码错误'
    })
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    logger.warn('登录失败：密码错误', { email, ip: getRequestIP(event) })
    throw createError({
      statusCode: 401,
      message: '邮箱或密码错误'
    })
  }

  // 生成 JWT token
  const config = useRuntimeConfig()
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )

  // 设置 cookie
  // 检测真实协议（考虑反向代理）
  const host = getRequestHeader(event, 'host') || ''
  const forwardedProto = getRequestHeader(event, 'x-forwarded-proto')
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')
  const isHTTPS = forwardedProto === 'https' || getRequestProtocol(event) === 'https'
  const isProduction = process.env.NODE_ENV === 'production'

  // Secure flag: HTTPS 或 localhost 不开启（本地测试）
  // 实际生产环境如果走 Cloudflare HTTPS，x-forwarded-proto 会是 https
  const secure = isHTTPS && !isLocalhost

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  logger.info('登录成功', {
    email,
    userId: user.id,
    role: user.role,
    secure,
    forwardedProto,
    host
  })

  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    }
  }
})
