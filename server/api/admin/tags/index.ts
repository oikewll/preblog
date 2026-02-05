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
  const method = event.method

  // 验证权限
  await verifyAuth(event)

  if (method === 'GET') {
    // 获取所有标签
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return {
      success: true,
      data: tags
    }
  }

  if (method === 'POST') {
    // 创建标签
    const body = await readBody(event)

    if (!body.name) {
      throw createError({
        statusCode: 400,
        message: '标签名称不能为空'
      })
    }

    // 生成 slug
    const slug = slugify(body.name, { lower: true, strict: true })

    const tag = await prisma.tag.create({
      data: {
        name: body.name,
        slug
      }
    })

    return {
      success: true,
      data: tag
    }
  }

  throw createError({
    statusCode: 405,
    message: '方法不允许'
  })
})
