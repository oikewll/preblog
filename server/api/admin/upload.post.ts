import jwt from 'jsonwebtoken'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readMultipartFormData } from 'h3'
import { randomUUID } from 'crypto'
import path from 'path'

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
  // 验证权限
  await verifyAuth(event)

  const config = useRuntimeConfig()

  // 校查 S3 配置是否存在
  if (!config.s3AccessKeyId || !config.s3SecretAccessKey || !config.s3Bucket || !config.s3Region) {
    throw createError({
      statusCode: 500,
      statusMessage: 'S3 配置不完整，请检查环境变量'
    })
  }

  // 解析 multipart 表单数据
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: '未上传文件'
    })
  }

  // 找到文件部分
  const filePart = formData.find(part => part.name === 'file' && part.filename)
  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: '未上传文件'
    })
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const contentType = filePart.headers?.['content-type'] || 'application/octet-stream'
  if (!allowedTypes.includes(contentType)) {
    throw createError({
      statusCode: 400,
      statusMessage: '不支持的文件类型，仅允许 jpg/png/gif/webp'
    })
  }

  // 限制文件大小（10MB）
  if (filePart.data.length > 10 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: '文件大小超限，最大 10MB'
    })
  }

  // 生成唯一文件名，保留原始后缀
  const ext = path.extname(filePart.filename)
  const key = `covers/${randomUUID()}${ext}`

  // 初始化 S3 客户端
  const s3Config: any = {
    region: config.s3Region,
    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey
    }
  }

  // 支持 S3 兼容服务（MinIO / Cloudflare R2 等）
  if (config.s3Endpoint) {
    s3Config.endpoint = config.s3Endpoint
    s3Config.forcePathStyle = true
  }

  const s3 = new S3Client(s3Config)

  // 上传文件到 S3
  await s3.send(new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
    Body: filePart.data,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000'
  }))

  // 拼接公开访问 URL
  const baseUrl = (config.s3PublicUrl || '').replace(/\/$/, '')
  const url = `${baseUrl}/${key}`

  return {
    success: true,
    url
  }
})
