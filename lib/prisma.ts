import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

// 解析数据库路径
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
const dbPath = dbUrl.replace(/^file:/, '')
const resolvedUrl = 'file:' + (path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath))

const adapter = new PrismaBetterSqlite3({ url: resolvedUrl })

let prismaInstance: PrismaClient | null = null

export default function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({ adapter } as any)
  }
  return prismaInstance
}
