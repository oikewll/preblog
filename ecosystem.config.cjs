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
