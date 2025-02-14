import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '无效的验证令牌' },
        { status: 400 }
      );
    }

    // 查找具有有效验证令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verifyTokenExpiry: {
          gt: new Date(),
        },
        emailVerified: false,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '无效或已过期的验证链接' },
        { status: 400 }
      );
    }

    // 更新用户的验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verifyTokenExpiry: null,
      },
    });

    return NextResponse.json({ 
      message: '邮箱验证成功',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
