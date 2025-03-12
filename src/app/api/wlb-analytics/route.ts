import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 创建Prisma客户端实例
const prisma = new PrismaClient();

// 定义前端发送的分析数据结构
interface WlbAnalyticsRequest {
  timestamp: string;
  formData: {
    age?: number;
    education?: string;
    salary?: number;
    workHours?: number;
    vacation?: number;
    commuteTime?: number;
    city?: string;
    benefits?: number;
    colleaguesAppearance?: number;
    colleaguesCompetence?: number;
    colleaguesEducation?: string;
    companySize?: string;
  };
  formCompletion: number;
  score: number | null;
}

// POST 处理函数 - 接收并存储分析数据
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as WlbAnalyticsRequest;
    const { formData, formCompletion, score } = data;
    
    // 添加额外的信息
    const sessionId = request.headers.get('x-session-id') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    // 将字符串时间戳转换为Date对象
    const timestamp = new Date(data.timestamp);
    
    // 使用Prisma客户端将数据存入数据库 - 使用动态访问方式
    const analyticsEntry = await (prisma as any).wlbAnalytics.create({
      data: {
        sessionId,
        timestamp,
        ipAddress,
        userAgent,
        formCompletion,
        score,
        
        // 表单数据字段
        age: formData.age,
        education: formData.education,
        salary: formData.salary,
        workHours: formData.workHours,
        vacation: formData.vacation,
        commuteTime: formData.commuteTime,
        city: formData.city,
        benefits: formData.benefits,
        colleaguesAppearance: formData.colleaguesAppearance,
        colleaguesCompetence: formData.colleaguesCompetence,
        colleaguesEducation: formData.colleaguesEducation,
        companySize: formData.companySize,
      }
    });
    
    console.log(`成功保存WLB分析数据，ID: ${analyticsEntry.id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: '数据已成功保存到数据库',
      id: analyticsEntry.id
    });
  } catch (error) {
    console.error('保存WLB分析数据失败:', error);
    return NextResponse.json(
      { success: false, message: '保存数据失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET 处理函数 - 获取已存储的分析数据 (带分页和筛选)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // 筛选参数
    const city = searchParams.get('city');
    const minScore = searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : undefined;
    const maxScore = searchParams.get('maxScore') ? parseFloat(searchParams.get('maxScore')!) : undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    
    // 构建查询条件
    const where: any = {};
    
    if (city) where.city = city;
    if (minScore !== undefined) where.score = { ...where.score, gte: minScore };
    if (maxScore !== undefined) where.score = { ...where.score, lte: maxScore };
    if (startDate) where.timestamp = { ...where.timestamp, gte: startDate };
    if (endDate) where.timestamp = { ...where.timestamp, lte: endDate };
    
    // 查询总记录数 - 使用动态访问方式
    const totalCount = await (prisma as any).wlbAnalytics.count({ where });
    
    // 查询数据并应用分页 - 使用动态访问方式
    const data = await (prisma as any).wlbAnalytics.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
    
    // 计算分数统计信息
    const stats = await prisma.$queryRaw`
      SELECT 
        AVG(score) as avgScore,
        MIN(score) as minScore,
        MAX(score) as maxScore,
        COUNT(*) as totalEntries
      FROM "wlb_analytics"
      WHERE score IS NOT NULL
    `;
    
    return NextResponse.json({ 
      success: true,
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats
    });
  } catch (error) {
    console.error('获取WLB分析数据失败:', error);
    return NextResponse.json(
      { success: false, message: '获取数据失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}
