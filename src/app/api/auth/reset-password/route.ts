import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    // 查找具有有效重置令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '无效或已过期的重置链接' },
        { status: 400 }
      )
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 更新用户密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: '密码重置成功' })
  } catch (error) {
    console.error('重置密码错误:', error)
    return NextResponse.json(
      { error: '重置密码失败' },
      { status: 500 }
    )
  }
}
