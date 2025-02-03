import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/config/api'
import { OpenAI } from 'openai'
import { getCurrentUser } from '@/lib/auth'
import getConfig from 'next/config'

// 获取服务器端配置
const { serverRuntimeConfig } = getConfig()

// 调试信息
console.log('API Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  model: API_CONFIG.MODEL,
  apiKeyExists: !!serverRuntimeConfig.ARK_API_KEY,
  environment: process.env.NODE_ENV
});

// 创建 OpenAI 客户端实例
const openai = new OpenAI({
  apiKey: serverRuntimeConfig.ARK_API_KEY || API_CONFIG.API_KEY,
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
    
    console.log('Received chat request:', {
      messageCount: messages?.length,
      chatId,
      firstMessage: messages?.[0]
    });

    // 验证必填字段
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '消息不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!chatId) {
      return new Response(JSON.stringify({ error: '聊天ID不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 验证消息格式
    const isValidMessages = messages.every(msg => 
      msg && 
      typeof msg === 'object' && 
      typeof msg.content === 'string' && 
      typeof msg.role === 'string' &&
      ['user', 'assistant', 'system'].includes(msg.role)
    )

    if (!isValidMessages) {
      return new Response(JSON.stringify({ error: '消息格式不正确' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 验证 API 密钥
    if (!serverRuntimeConfig.ARK_API_KEY && !API_CONFIG.API_KEY) {
      console.error('No API key found in either serverRuntimeConfig or API_CONFIG');
      return new Response(JSON.stringify({ error: 'API 配置错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Sending request to OpenAI API:', {
      model: API_CONFIG.MODEL,
      messageCount: messages.length,
      systemPrompt: API_CONFIG.SYSTEM_PROMPT
    });

    try {
      // 准备消息历史
      const response = await openai.chat.completions.create({
        model: API_CONFIG.MODEL,
        messages: [
          { role: 'system', content: API_CONFIG.SYSTEM_PROMPT },
          ...messages
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      })

      // 创建一个 TransformStream 来处理响应
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                // 构造豆包 API 格式的响应
                const message = {
                  choices: [{
                    delta: { content },
                    index: 0,
                    finish_reason: null
                  }]
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Stream processing error:', error)
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
    } catch (error: any) {
      console.error('Error from OpenAI API:', {
        error: error.message,
        status: error.status,
        type: error.type
      });
      
      return new Response(
        JSON.stringify({ 
          error: '聊天服务暂时不可用',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }),
        { 
          status: error.status || 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: '处理请求失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
