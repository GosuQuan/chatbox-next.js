import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: params.chatId,
        userId: user.id
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
        }
      }
    })

    if (!chat) {
      return NextResponse.json({ error: '聊天不存在' }, { status: 404 })
    }

    return NextResponse.json({
      ...chat,
      title: chat.messages[0]?.content.slice(0, 8) || 'New Chat' // 限制标题最多8个字
    })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: '获取聊天信息失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params

    // 先删除聊天相关的所有消息
    await prisma.message.deleteMany({
      where: {
        chatId: chatId,
      },
    })

    // 然后删除聊天
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 })
  }
}
