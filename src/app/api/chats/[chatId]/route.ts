import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
