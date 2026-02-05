import jwt from 'jsonwebtoken'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'

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
  // 验证权限
  await verifyAuth(event)

  try {
    const formData = await readFormData(event)
    const file = formData.get('file') as File

    if (!file) {
      throw createError({
        statusCode: 400,
        message: '未找到文件'
      })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        message: '不支持的文件类型'
      })
    }

    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw createError({
        statusCode: 400,
        message: '文件大小超过限制（10MB）'
      })
    }

    // 生成文件名
    const ext = file.name.split('.').pop()
    const key = `covers/${crypto.randomUUID()}.${ext}`

    // 上传到 S3
    const config = useRuntimeConfig()
    const s3Client = new S3Client({
      region: config.s3Region,
      endpoint: config.s3Endpoint,
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey
      }
    })

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: config.s3Bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 1, maxSize],
        ['starts-with', '$Content-Type', file.type]
      ],
      Fields: {
        'Content-Type': file.type
      },
      Expires: 600
    })

    // 使用 fetch 上传文件到 S3
    const formDataS3 = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formDataS3.append(key, value as string)
    })
    formDataS3.append('file', file)

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formDataS3
    })

    if (!uploadResponse.ok) {
      throw createError({
        statusCode: 500,
        message: 'S3 上传失败'
      })
    }

    // 返回公网访问 URL
    const publicUrl = `${config.s3PublicUrl}/${key}`

    return {
      success: true,
      url: publicUrl
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '上传失败'
    })
  }
})
