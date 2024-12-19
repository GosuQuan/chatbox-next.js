import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // 允许访问的公共路径
  const publicPaths = ['/auth/login', '/auth/register'];
  
  // 如果是公共路径且已登录，重定向到主页
  if (publicPaths.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // 如果不是公共路径且未登录，重定向到登录页
  if (!publicPaths.includes(pathname) && !token && !pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
