import { NextResponse } from 'next/server'
import { ModelType, getModelConfig } from '@/config/api'
import { OpenAI } from 'openai'
import { getCurrentUser } from '@/lib/auth'
import getConfig from 'next/config'

// 获取服务器端配置
const { serverRuntimeConfig } = getConfig()

// 默认使用豆包模型
const defaultModelType = ModelType.DOUPACK;
const defaultConfig = getModelConfig(defaultModelType);

// 调试信息
console.log('API Configuration:', {
  baseUrl: defaultConfig.baseURL,
  model: defaultConfig.model,
  apiKeyExists: {
    [ModelType.DOUPACK]: !!serverRuntimeConfig.ARK_API_KEY,
    [ModelType.DEEPSEEKR1]: !!serverRuntimeConfig.ARK_API_KEY
  },
  environment: process.env.NODE_ENV
});

// 获取API密钥的辅助函数
const getApiKey = (modelType: ModelType) => {
  switch (modelType) {
    case ModelType.DOUPACK:
      return serverRuntimeConfig.ARK_API_KEY
    case ModelType.DEEPSEEKR1:
      return serverRuntimeConfig.ARK_API_KEY
    default:
      return null
  }
}

// 创建 OpenAI 客户端实例的辅助函数
const createOpenAIClient = (modelType: ModelType, config: any) => {
  return new OpenAI({
    apiKey: getApiKey(modelType) || config.apiKey,
    baseURL: config.baseURL
  })
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return new Response(JSON.stringify({ error: '请先登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { messages, chatId, modelType = ModelType.DOUPACK } = await req.json()
    
    // 验证模型类型
    if (!Object.values(ModelType).includes(modelType)) {
      return new Response(JSON.stringify({ error: '不支持的模型类型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 获取选择的模型配置
    const config = getModelConfig(modelType as ModelType)
    
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
    const apiKey = getApiKey(modelType as ModelType) || config.apiKey
    
    if (!apiKey) {
      console.error('No API key found for the selected model');
      return new Response(JSON.stringify({ error: 'API 配置错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Sending request to OpenAI API:', {
      model: config.model,
      messageCount: messages.length,
      systemPrompt: config.systemPrompt
    });

    try {
      // 准备消息历史
      // 为每个请求创建新的OpenAI客户端实例
      const openai = createOpenAIClient(modelType as ModelType, config)
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: 0.3,
        max_tokens: 4096,
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
