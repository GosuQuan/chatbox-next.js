import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// 获取单个聊天详情
export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const userId = await auth();
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: params.chatId,
        userId, // 确保只能访问自己的聊天
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: '聊天不存在' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: '获取聊天详情失败' },
      { status: 500 }
    );
  }
}

// 删除聊天
export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const userId = await auth();
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 验证聊天所有权
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.chatId,
        userId,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: '聊天不存在' }, { status: 404 });
    }

    // 删除聊天及其所有消息（通过级联删除）
    await prisma.chat.delete({
      where: {
        id: params.chatId,
      },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: '删除聊天失败' },
      { status: 500 }
    );
  }
}

// 更新聊天标题
export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const userId = await auth();
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    // 验证聊天所有权并更新
    const chat = await prisma.chat.updateMany({
      where: {
        id: params.chatId,
        userId,
      },
      data: { title },
    });

    if (!chat.count) {
      return NextResponse.json({ error: '聊天不存在' }, { status: 404 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: '更新聊天失败' },
      { status: 500 }
    );
  }
}
