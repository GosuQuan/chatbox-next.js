import { PrismaClient } from '@prisma/client';

// 调试信息
console.log('Current environment:', process.env.NODE_ENV);
console.log('Database URL exists:', !!process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 如果没有找到环境变量，使用默认值（仅用于开发环境）
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bFHyLzn3i1lA@ep-autumn-sunset-a1l1vput-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 测试数据库连接
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    console.error('Current database URL:', databaseUrl);
  });

export default prisma;
