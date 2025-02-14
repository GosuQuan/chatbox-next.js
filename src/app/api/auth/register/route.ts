import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, verifyCode } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        NOT: {
          password: ''
        }
      },
    }).catch(error => {
      console.error('Error checking existing user:', error);
      throw error;
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 验证验证码
    const tempUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!tempUser) {
      return NextResponse.json(
        { error: '请先获取验证码' },
        { status: 400 }
      );
    }

    if (!tempUser.verifyCode || !tempUser.verifyCodeExpiry) {
      return NextResponse.json(
        { error: '请先获取验证码' },
        { status: 400 }
      );
    }

    if (tempUser.verifyCodeExpiry < new Date()) {
      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      );
    }

    if (tempUser.verifyCode !== verifyCode) {
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新用户信息
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        verifyCode: null,
        verifyCodeExpiry: null,
        emailVerified: true, // 设置邮箱为已验证
      },
    }).catch(error => {
      console.error('Error updating user:', error);
      throw error;
    });

    return NextResponse.json({ 
      message: '注册成功！',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified // 使用实际的emailVerified状态
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
