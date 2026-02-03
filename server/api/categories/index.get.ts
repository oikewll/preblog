import getPrisma from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              published: true
            }
          }
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
})
