import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/config/api'
import { OpenAI } from 'openai'

// 创建 OpenAI 客户端实例
const openai = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: API_CONFIG.BASE_URL
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

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
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
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
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
