module.exports = {
  apps: [
    {
      name: 'preblog',
      script: '.output/server/index.mjs',
      cwd: '/home/wwwroot/preblog',
      env: {
        PORT: 3480,
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./dev.db',
        JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-change-in-production',
        // S3 credentials — set via shell env or .env before starting PM2
        S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || '',
        S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || '',
        S3_REGION: process.env.S3_REGION || 'ap-southeast-1',
        S3_BUCKET: process.env.S3_BUCKET || '',
        S3_ENDPOINT: process.env.S3_ENDPOINT || '',
        S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || '',
      },
      // 日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '/home/wwwroot/preblog/logs/out.log',
      error_file: '/home/wwwroot/preblog/logs/err.log',
      merge_logs: true,
      // 重启策略
      restart_delay: 1000,
      max_memory_restart: '512M',
    },
  ],
};
