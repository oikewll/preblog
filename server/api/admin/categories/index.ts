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
  const method = event.method

  // 验证权限
  await verifyAuth(event)

  if (method === 'GET') {
    // 获取所有分类
    const categories = await prisma.category.findMany({
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
      data: categories
    }
  }

  if (method === 'POST') {
    // 创建分类
    const body = await readBody(event)

    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: '分类名称不能为空'
      })
    }

    // 生成 slug
    const slug = slugify(body.name, { lower: true, strict: true })

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null
      }
    })

    return {
      success: true,
      data: category
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: '方法不允许'
  })
})
