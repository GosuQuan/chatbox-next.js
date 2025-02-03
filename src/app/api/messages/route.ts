import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // 验证用户是否登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { chatId, content, role } = await request.json()

    // 验证必填字段
    if (!chatId) {
      return NextResponse.json(
        { error: '聊天ID不能为空' },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      )
    }

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { error: '无效的消息角色' },
        { status: 400 }
      )
    }

    // 验证聊天是否存在且属于当前用户
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id
      }
    })

    if (!chat) {
      return NextResponse.json(
        { error: '聊天不存在或无权访问' },
        { status: 404 }
      )
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        content,
        role,
        chatId,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: '创建消息失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // 验证用户是否登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: '聊天ID不能为空' },
        { status: 400 }
      )
    }

    // 验证聊天是否存在且属于当前用户
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id
      }
    })

    if (!chat) {
      return NextResponse.json(
        { error: '聊天不存在或无权访问' },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: '获取消息失败' },
      { status: 500 }
    )
  }
}
