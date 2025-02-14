import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/utils/mail'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 404 }
      )
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 保存重置令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // 发送重置邮件
    await sendEmail({
      to: email,
      subject: '重置密码',
      token: resetToken,
      type: 'reset'
    })

    return NextResponse.json({ message: '重置邮件已发送' })
  } catch (error) {
    console.error('忘记密码错误:', error)
    return NextResponse.json(
      { error: '发送重置邮件失败' },
      { status: 500 }
    )
  }
}
