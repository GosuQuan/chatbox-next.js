import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '密码错误' },
        { status: 401 }
      );
    }

    // 创建一个简单的token（在实际应用中应该使用JWT）
    const token = Buffer.from(user.id + ':' + Date.now()).toString('base64');
    
    // 设置cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ message: '登录成功' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '登录失败' },
      { status: 500 }
    );
  }
}
