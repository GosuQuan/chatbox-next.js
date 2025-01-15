import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/config/api'
import { OpenAI } from 'openai'
import { getCurrentUser } from '@/lib/auth'

// 创建 OpenAI 客户端实例
const openai = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: API_CONFIG.BASE_URL
})

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
    console.log('Received request:', { messages, chatId })

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 准备消息历史
    const requestMessages = [
      { role: 'system', content: API_CONFIG.SYSTEM_PROMPT },
      ...messages
    ]
    console.log('Sending to API:', {
      model: API_CONFIG.MODEL,
      messages: requestMessages,
      baseURL: API_CONFIG.BASE_URL,
      apiKey: process.env.ARK_API_KEY ? '已设置' : '未设置'
    })

    const response = await openai.chat.completions.create({
      model: API_CONFIG.MODEL,
      messages: requestMessages,
      stream: true,
    })

    // 创建一个 TransformStream 来处理响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          for await (const chunk of response) {
            console.log('Received chunk:', chunk)
            
            // 检查 chunk 的格式
            let content = ''
            if (typeof chunk === 'string') {
              try {
                const parsedChunk = JSON.parse(chunk)
                content = parsedChunk.choices?.[0]?.delta?.content || ''
              } catch (e) {
                console.log('Failed to parse chunk:', chunk, e)
                continue
              }
            } else {
              content = chunk.choices[0]?.delta?.content || ''
            }

            if (content) {
              fullContent += content
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.error(error)
        } finally {
          controller.close()
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

  } catch (error: any) {
    console.error('Chat API error:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    })
    return new Response(JSON.stringify({ 
      error: '聊天请求失败', 
      details: error.message,
      status: error.status
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
