import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import getPrisma from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()
  const body = await readBody(event)

  const { email, password } = body

  // 验证输入
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '邮箱和密码不能为空'
    })
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '邮箱或密码错误'
    })
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: '邮箱或密码错误'
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
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
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
