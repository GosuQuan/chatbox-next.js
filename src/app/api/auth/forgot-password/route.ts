import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 404 }
      )
    }

    // 生成重置令牌
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期

    // 保存重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: tokenExpiry
      }
    })

    // 构建重置链接
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

    // 发送重置邮件
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: '重置密码',
      html: `
        <h1>重置密码</h1>
        <p>您好，</p>
        <p>我们收到了重置您密码的请求。如果这不是您本人的操作，请忽略此邮件。</p>
        <p>点击下面的链接重置密码：</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>此链接将在30分钟后失效。</p>
        <p>如果您无法点击上面的链接，请复制链接到浏览器地址栏访问。</p>
      `
    })

    return NextResponse.json({ message: '重置邮件已发送' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: '发送重置邮件失败' },
      { status: 500 }
    )
  }
}
