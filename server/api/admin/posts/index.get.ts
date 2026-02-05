import jwt from 'jsonwebtoken'
import getPrisma from '../../../../lib/prisma'

// 验证管理员权限
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

  const query = getQuery(event)

  // 分页参数
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const skip = (page - 1) * pageSize

  // 筛选参数
  const where: any = {}

  if (query.status === 'published') {
    where.published = true
  } else if (query.status === 'draft') {
    where.published = false
  }

  if (query.category) {
    where.categoryId = query.category
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search as string } },
      { excerpt: { contains: query.search as string } }
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: pageSize,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.post.count({ where })
  ])

  return {
    success: true,
    data: {
      posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
})
