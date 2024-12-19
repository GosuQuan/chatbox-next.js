import { create } from 'zustand'
import { Message } from '@/types/chat'

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
        throw new Error('Failed to create chat')
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
        throw new Error('Failed to load chats')
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
        throw new Error(error.message || 'Failed to delete chat')
      }
      
      const { chats, currentChatId } = get()
      set({ 
        chats: chats.filter(chat => chat.id !== chatId),
        currentChatId: currentChatId === chatId ? null : currentChatId,
        messages: currentChatId === chatId ? [] : get().messages
      })
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
      chatId = await get().createChat()
    }
    
    const userMessage: Message = {
      role: 'user',
      content,
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
          chatId,
          content,
          role: 'user',
        }),
      })

      if (!messageResponse.ok) {
        throw new Error('Failed to save message')
      }

      // 更新聊天标题
      if (messages.length === 0) {
        set({
          chats: chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, title: content.slice(0, 10) + (content.length > 10 ? '...' : '') }
              : chat
          )
        })
      }

      // Create new AbortController for this request
      const abortController = new AbortController()
      set({ abortController })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5)
            if (data === '[DONE]') continue

            try {
              const { content } = JSON.parse(data)
              assistantMessage += content
              
              // Update UI with current assistant message
              set({
                messages: [
                  ...messages,
                  userMessage,
                  { role: 'assistant', content: assistantMessage },
                ],
              })
            } catch (e) {
              console.error('Error parsing SSE message:', e)
            }
          }
        }
      }

      // Save assistant message to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          content: assistantMessage,
          role: 'assistant',
        }),
      })

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Error sending message:', error)
      }
    } finally {
      set({ isGenerating: false, abortController: null })
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
