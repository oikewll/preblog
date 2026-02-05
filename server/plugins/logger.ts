import { createLogger, format, transports, Logger } from 'winston'
import path from 'path'

const LOG_DIR = path.resolve(process.cwd(), 'logs')

// 时间格式
const timestampFormat = format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })

// 控制台格式（带颜色）
const consoleFormat = format.combine(
  timestampFormat,
  format.colorize(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level}: ${message}${metaStr}`
  })
)

// 文件格式（JSON）
const fileFormat = format.combine(
  timestampFormat,
  format.json()
)

// 创建 logger 实例
const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // 控制台输出
    new transports.Console({
      format: consoleFormat
    }),
    // info 及以上 → app.log
    new transports.File({
      filename: path.join(LOG_DIR, 'app.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    // error 专用 → error.log
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5
    })
  ]
})

// Nuxt server plugin — 挂载到全局，所有 server handler 可用
export default defineNitroPlugin(() => {
  // 暴露到全局，可通过 useLogger() 访问
  ;(globalThis as any).__preblog_logger = logger
})

/**
 * 在 server handler 中使用:
 *   import { useLogger } from '~/server/plugins/logger'
 *   const logger = useLogger()
 *   logger.info('用户登录', { email })
 *   logger.error('登录失败', { error: e.message })
 *   logger.warn('可疑访问', { ip, url })
 */
export function useLogger(): Logger {
  return (globalThis as any).__preblog_logger || logger
}
