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
  const tagId = getRouterParam(event, 'id')

  // 验证权限
  await verifyAuth(event)

  if (!tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: '标签 ID 不能为空'
    })
  }

  if (method === 'PUT') {
    // 更新标签
    const body = await readBody(event)

    const updateData: any = {}
    if (body.name !== undefined) {
      updateData.name = body.name
      updateData.slug = slugify(body.name, { lower: true, strict: true })
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: updateData
    })

    return {
      success: true,
      data: tag
    }
  }

  if (method === 'DELETE') {
    // 删除标签
    await prisma.tag.delete({
      where: { id: tagId }
    })

    return {
      success: true,
      message: '标签已删除'
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: '方法不允许'
  })
})
