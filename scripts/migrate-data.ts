import { PrismaClient as PrismaClientPostgres } from '@prisma/client';
import { PrismaClient as PrismaClientMysql } from '@prisma/client';
import redis from '../src/lib/redis';

// PostgreSQL连接
const postgresDb = new PrismaClientPostgres({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL // 原PostgreSQL数据库URL
    }
  }
});

// MySQL连接
const mysqlDb = new PrismaClientMysql({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // 新MySQL数据库URL
    }
  }
});

async function migrateUsers() {
  console.log('开始迁移用户数据...');
  const users = await postgresDb.user.findMany();
  
  for (const user of users) {
    await mysqlDb.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  }
  console.log(`成功迁移 ${users.length} 个用户`);
}

async function migrateChats() {
  console.log('开始迁移聊天数据...');
  const chats = await postgresDb.chat.findMany({
    include: {
      messages: true
    }
  });
  
  for (const chat of chats) {
    // 迁移聊天记录到MySQL
    await mysqlDb.chat.create({
      data: {
        id: chat.id,
        title: chat.title,
        userId: chat.userId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: {
          create: chat.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            createdAt: msg.createdAt
          }))
        }
      }
    });

    // 将聊天记录缓存到Redis
    const chatKey = `chat:${chat.id}`;
    await redis.hset(chatKey, {
      title: chat.title || '',
      userId: chat.userId,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    });

    // 设置过期时间（例如7天）
    await redis.expire(chatKey, 60 * 60 * 24 * 7);
  }
  console.log(`成功迁移 ${chats.length} 个聊天记录`);
}

async function migrateKnowledgeBase() {
  console.log('开始迁移知识库数据...');
  const knowledgeBases = await postgresDb.knowledgeBase.findMany();
  
  for (const kb of knowledgeBases) {
    // 迁移到MySQL
    await mysqlDb.knowledgeBase.create({
      data: {
        id: kb.id,
        title: kb.title,
        content: kb.content,
        embedding: kb.embedding,
        metadata: kb.metadata,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt
      }
    });

    // 缓存到Redis
    const kbKey = `kb:${kb.id}`;
    await redis.hset(kbKey, {
      title: kb.title,
      content: kb.content,
      createdAt: kb.createdAt.toISOString(),
      updatedAt: kb.updatedAt.toISOString()
    });

    if (kb.embedding) {
      await redis.hset(kbKey, 'embedding', JSON.stringify(kb.embedding));
    }
    
    // 设置过期时间（例如30天）
    await redis.expire(kbKey, 60 * 60 * 24 * 30);
  }
  console.log(`成功迁移 ${knowledgeBases.length} 条知识库数据`);
}

async function main() {
  try {
    console.log('开始数据迁移...');
    
    // 按顺序执行迁移
    await migrateUsers();
    await migrateChats();
    await migrateKnowledgeBase();
    
    console.log('数据迁移完成！');
  } catch (error) {
    console.error('迁移过程中出错:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    await postgresDb.$disconnect();
    await mysqlDb.$disconnect();
    await redis.quit();
  }
}

// 运行迁移
main();
