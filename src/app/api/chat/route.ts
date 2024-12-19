import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/config/api'
import { OpenAI } from 'openai'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 创建 OpenAI 客户端实例
const openai = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: API_CONFIG.BASE_URL
})

// 获取用户的所有聊天
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ error: '请先登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return new Response(JSON.stringify(chats), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return new Response(JSON.stringify({ error: '获取聊天记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 创建新聊天
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ error: '请先登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { messages, chatId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 准备消息历史
    const response = await openai.chat.completions.create({
      model: API_CONFIG.MODEL,
      messages: [
        { role: 'system', content: API_CONFIG.SYSTEM_PROMPT },
        ...messages
      ],
      stream: true,
    })

    // 创建一个 TransformStream 来处理响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({ error: '处理请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
