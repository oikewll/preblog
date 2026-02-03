import getPrisma from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()
  const query = getQuery(event)

  // 分页参数
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const skip = (page - 1) * pageSize

  // 筛选参数
  const where: any = {}

  // 只显示已发布的文章（前端）
  if (query.published !== 'all') {
    where.published = true
  }

  // 分类筛选
  if (query.category) {
    where.category = {
      slug: query.category
    }
  }

  // 标签筛选
  if (query.tag) {
    where.tags = {
      some: {
        tag: {
          slug: query.tag
        }
      }
    }
  }

  // 搜索
  if (query.search) {
    where.OR = [
      { title: { contains: query.search as string } },
      { excerpt: { contains: query.search as string } },
      { content: { contains: query.search as string } }
    ]
  }

  // 查询文章
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
            email: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
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
