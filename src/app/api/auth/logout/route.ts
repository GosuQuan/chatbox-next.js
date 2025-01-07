import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore =   cookies();
    await cookieStore.delete('auth-token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return NextResponse.json({ 
      message: '注销成功',
      shouldResetState: true  // 添加标志告诉前端需要重置状态
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '注销失败，请重试' },
      { status: 500 }
    );
  }
}
