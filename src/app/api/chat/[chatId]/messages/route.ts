import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OpenAI } from 'openai';
import { API_CONFIG } from '@/config/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: API_CONFIG.BASE_URL,
});

export async function POST(
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
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: '聊天不存在' }, { status: 404 });
    }

    const { content } = await request.json();

    // 保存用户消息
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        chatId: params.chatId,
      },
    });

    // 准备历史消息
    const messages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    messages.push({ role: 'user', content });

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      messages: messages as any,
      model: 'gpt-3.5-turbo',
    });

    const assistantResponse = completion.choices[0]?.message?.content || '对不起，我没有理解您的问题。';

    // 保存助手回复
    const assistantMessage = await prisma.message.create({
      data: {
        content: assistantResponse,
        role: 'assistant',
        chatId: params.chatId,
      },
    });

    // 更新聊天标题（如果是第一条消息）
    if (chat.messages.length === 0) {
      await prisma.chat.update({
        where: { id: params.chatId },
        data: { title: content.slice(0, 50) },
      });
    }

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: '发送消息失败' },
      { status: 500 }
    );
  }
}
