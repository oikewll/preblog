import getPrisma from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrisma()
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
})
