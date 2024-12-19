import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  try {
    const cookiesList =  await cookies();
    const authToken = cookiesList.get('auth-token');

    if (!authToken) {
      return null;
    }

    // 从token中解析用户ID
    const [userId] = Buffer.from(authToken.value, 'base64').toString().split(':');
    
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function createAuthToken(userId: string) {
  // 创建一个简单的token格式：userId:timestamp
  const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
  return token;
}
