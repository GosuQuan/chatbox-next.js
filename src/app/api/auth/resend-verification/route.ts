import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/utils/mail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: '邮箱已验证' },
        { status: 400 }
      );
    }

    // 生成新的验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 更新用户的验证令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verifyTokenExpiry,
      },
    });

    // 发送验证邮件
    await sendEmail({
      to: email,
      subject: '验证您的邮箱',
      token: verificationToken,
      type: 'verify'
    });

    return NextResponse.json({ message: '验证邮件已发送' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: '发送验证邮件失败' },
      { status: 500 }
    );
  }
}
