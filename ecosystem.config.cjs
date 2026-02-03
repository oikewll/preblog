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
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
        S3_ACCESS_KEY_ID: 'REDACTED',
        S3_SECRET_ACCESS_KEY: 'REDACTED',
        S3_REGION: 'ap-southeast-1',
        S3_BUCKET: 'test-pandelivery',
        S3_ENDPOINT: '',
        S3_PUBLIC_URL: 'https://s3.33486698.xyz',
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
