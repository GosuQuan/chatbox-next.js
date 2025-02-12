import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 先删除没有消息的对话
    await prisma.chat.deleteMany({
      where: {
        userId: user.id,
        messages: {
          none: {} // 删除没有消息的对话
        }
      }
    });

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1,
          where: {
            role: 'user'  // 只获取用户消息
          }
        },
        user: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // 处理每个聊天的标题
    const processedChats = chats.map(chat => ({
      ...chat,
      title: chat.messages[0]?.content.slice(0, 8) || 'New Chat' // 限制标题最多8个字
    }))

    return NextResponse.json(processedChats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: '获取聊天列表失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    let title = 'New Chat';
    
    try {
      const body = await request.json();
      if (body && body.title) {
        title = body.title;
      }
    } catch (e) {
      console.log('Using default title');
    }

    // 创建新的聊天
    const chat = await prisma.chat.create({
      data: {
        title,
        userId: user.id,
      },
      include: {
        messages: true,
        user: true,
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: '创建聊天失败' }, { status: 500 });
  }
}
