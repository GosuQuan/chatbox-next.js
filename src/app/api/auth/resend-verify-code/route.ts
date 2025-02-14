import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/mail';

function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已完成注册
    const registeredUser = await prisma.user.findFirst({
      where: { 
        email,
        NOT: {
          password: ''
        }
      },
    });

    if (registeredUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 检查是否可以重新发送验证码
    const tempUser = await prisma.user.findUnique({
      where: { email },
    });

    const now = new Date();
    if (tempUser?.verifyCodeExpiry && tempUser.verifyCodeExpiry > now) {
      const remainingSeconds = Math.ceil((tempUser.verifyCodeExpiry.getTime() - now.getTime()) / 1000);
      // 如果验证码仍然有效，返回剩余时间，但允许30秒后重新发送
      return NextResponse.json(
        { 
          message: '验证码仍然有效',
          remainingSeconds 
        }
      );
    }

    // 生成新的验证码
    const verifyCode = generateVerifyCode();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 更新或创建用户
    await prisma.user.upsert({
      where: { email },
      update: {
        verifyCode,
        verifyCodeExpiry,
      },
      create: {
        email,
        password: '', // 临时密码，注册时会更新
        verifyCode,
        verifyCodeExpiry,
        emailVerified: false,
      },
    });

    // 发送验证码邮件
    await sendEmail({
      to: email,
      subject: '注册验证码',
      token: verifyCode,
      type: 'code'
    });

    return NextResponse.json({ message: '验证码已重新发送' });
  } catch (error) {
    console.error('Resend verification code error:', error);
    return NextResponse.json(
      { error: '发送验证码失败' },
      { status: 500 }
    );
  }
}
