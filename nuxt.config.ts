// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    'nuxt-s3-upload'  // ← 新增
  ],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  // ← 新增：S3 上传模块配置
  s3Upload: {
    mode: 'api',                      // API 中转上传（原逻辑）
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024,   // 10MB
    keyPrefix: 'uploads/',
    presignExpires: 300
  },

  runtimeConfig: {
    // Private keys (server-side only)
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-change-in-production',
    jwtExpiresIn: '7d',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://superman:superman@localhost:5432/preblog',

    // S3 上传配置（仅服务端使用）
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    s3Region: process.env.S3_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET || '',
    s3Endpoint: process.env.S3_ENDPOINT || '',       // S3 兼容服务的 endpoint（可选）
    s3PublicUrl: process.env.S3_PUBLIC_URL || '',     // 上传后文件的公开访问地址前缀

    // Public keys (exposed to client)
    public: {
      apiBase: '/api'
    }
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
