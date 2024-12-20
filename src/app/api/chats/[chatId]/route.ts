import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

/**
 * DELETE /api/chats/:chatId - 删除聊天
 *
 * 需要登录
 * 只能删除自己的聊天
 * 会删除该聊天下的所有消息
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.chatId 聊天ID
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 先删除聊天相关的所有消息
    await prisma.message.deleteMany({
      where: {
        chatId: params.chatId
      }
    })

    // 然后删除聊天
    await prisma.chat.delete({
      where: {
        id: params.chatId,
        userId: user.id  // 确保只能删除自己的聊天
      }
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
