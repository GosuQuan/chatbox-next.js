import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    // 验证参数
    if (!token || !password) {
      return NextResponse.json(
        { error: '无效的请求参数' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 查找具有有效重置令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // 确保令牌未过期
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '重置链接无效或已过期' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 更新用户密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({ message: '密码重置成功' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: '重置密码失败' },
      { status: 500 }
    )
  }
}
