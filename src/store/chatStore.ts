import { create } from 'zustand'
import { Message } from '@/types/chat'
import { message } from 'antd'

interface Chat {
  id: string
  title: string
  messages: Message[]
}

interface ChatStore {
  messages: Message[]
  chats: Chat[]
  currentChatId: string | null
  isGenerating: boolean
  abortController: AbortController | null
  createChat: () => Promise<string>
  loadChats: () => Promise<void>
  setCurrentChat: (chatId: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  stopGeneration: () => void
  loadMessages: (chatId: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  chats: [],
  currentChatId: null,
  isGenerating: false,
  abortController: null,

  createChat: async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        message.error(error.error || '创建聊天失败')
        throw new Error(error.error || '创建聊天失败')
      }

      const chat = await response.json()
      set(state => ({ 
        chats: [...state.chats, chat],
        currentChatId: chat.id,
        messages: []
      }))
      return chat.id
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  },

  loadChats: async () => {
    try {
      const response = await fetch('/api/chats')
      if (!response.ok) {
        const error = await response.json()
        message.error(error.error || '加载聊天列表失败')
        throw new Error(error.error || '加载聊天列表失败')
      }
      const chats = await response.json()
      set({ chats })
    } catch (error) {
      console.error('Error loading chats:', error)
      throw error
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      if (!response.ok) {
        throw new Error('Failed to load messages')
      }
      const messages = await response.json()
      set({ messages })
    } catch (error) {
      console.error('Error loading messages:', error)
      throw error
    }
  },

  setCurrentChat: async (chatId: string) => {
    set({ currentChatId: chatId })
    await get().loadMessages(chatId)
  },

  deleteChat: async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        message.error(error.error || '删除聊天失败')
        throw new Error(error.error || '删除聊天失败')
      }

      set(state => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        messages: state.currentChatId === chatId ? [] : state.messages,
      }))
    } catch (error) {
      console.error('Error deleting chat:', error)
      throw error
    }
  },

  sendMessage: async (content: string) => {
    const { messages, currentChatId, chats } = get()
    
    // 如果没有当前聊天，先创建一个
    let chatId = currentChatId
    if (!chatId) {
      try {
        chatId = await get().createChat()
      } catch (error) {
        message.error('创建新对话失败')
        return
      }
    }
    
    if (!content.trim()) {
      message.error('消息内容不能为空')
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      chatId
    }

    // Add user message to UI immediately
    set({ messages: [...messages, userMessage], isGenerating: true })

    try {
      // Save user message to database
      const messageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage.content,
          role: userMessage.role,
          chatId: chatId
        }),
      })

      if (!messageResponse.ok) {
        const error = await messageResponse.json()
        console.error('Failed to save message:', error)
        set({ messages: messages, isGenerating: false }) // 回滚消息
        message.error(error.error || '发送消息失败')
        return
      }

      // Create new AbortController for this request
      const abortController = new AbortController()
      set({ abortController })

      // Send message to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          chatId
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        message.error('无法读取响应流')
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let assistantMessage = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          console.log('Received chunk:', chunk)

          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                console.log('Parsed response:', parsed)

                if (parsed.choices?.[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content
                  assistantMessage += content
                  
                  // Update UI with current assistant message
                  set({
                    messages: [
                      ...messages,
                      userMessage,
                      { role: 'assistant', content: assistantMessage },
                    ],
                  })
                }
              } catch (e) {
                console.error('Error parsing SSE message:', e, 'Raw data:', data)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error)
        throw error
      } finally {
        reader.releaseLock()
      }

      // Save assistant message to database
      if (assistantMessage.trim()) {  
        const saveResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId,
            content: assistantMessage.trim(),
            role: 'assistant',
          }),
        })

        if (!saveResponse.ok) {
          const error = await saveResponse.json()
          console.error('Failed to save assistant message:', error)
          message.error(error.error || '保存AI响应失败')
        }
      }

      set({ isGenerating: false })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        message.info('已停止生成')
      } else {
        console.error('Error sending message:', error)
        message.error('发送消息失败')
      }
    } finally {
      set({ abortController: null })
    }
  },

  stopGeneration: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
      set({ isGenerating: false, abortController: null })
    }
  },
}))
