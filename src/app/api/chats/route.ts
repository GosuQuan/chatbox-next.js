import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
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
    })

    // 处理每个聊天的标题
    const processedChats = chats.map(chat => ({
      ...chat,
      title: chat.messages[0]?.content.slice(0, 10) + (chat.messages[0]?.content.length > 10 ? '...' : '') || 'New Chat'
    }))

    return NextResponse.json(processedChats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json()

    // 先确保有一个临时用户
    let user = await prisma.user.findFirst({
      where: {
        email: 'temp@example.com'
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'temp@example.com',
          name: 'Temporary User'
        }
      })
    }

    // 使用临时用户创建聊天
    const chat = await prisma.chat.create({
      data: {
        title: title || 'New Chat',
        userId: user.id,
      },
      include: {
        messages: true,
      },
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
  }
}
