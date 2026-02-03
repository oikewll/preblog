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
  const categoryId = getRouterParam(event, 'id')

  // 验证权限
  await verifyAuth(event)

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: '分类 ID 不能为空'
    })
  }

  if (method === 'PUT') {
    // 更新分类
    const body = await readBody(event)

    const updateData: any = {}
    if (body.name !== undefined) {
      updateData.name = body.name
      updateData.slug = slugify(body.name, { lower: true, strict: true })
    }
    if (body.description !== undefined) {
      updateData.description = body.description
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    })

    return {
      success: true,
      data: category
    }
  }

  if (method === 'DELETE') {
    // 删除分类
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: '分类不存在'
      })
    }

    if (category._count.posts > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该分类下还有文章，无法删除'
      })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return {
      success: true,
      message: '分类已删除'
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: '方法不允许'
  })
})
