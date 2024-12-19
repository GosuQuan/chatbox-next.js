import { create } from 'zustand'
import { message } from 'antd'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  messages: Message[]
  isGenerating: boolean
  loadChats: () => Promise<void>
  createChat: () => Promise<void>
  setCurrentChat: (chatId: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  stopGeneration: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  isGenerating: false,

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

      const newChat = await response.json()
      set(state => ({
        chats: [newChat, ...state.chats],
        currentChatId: newChat.id,
        messages: [],
      }))
    } catch (error) {
      console.error('Error creating chat:', error)
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

  loadMessages: async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      const messages = await response.json()
      set({ messages })
    } catch (error) {
      console.error('Error loading messages:', error)
      throw error
    }
  },

  sendMessage: async (content: string) => {
    const { currentChatId, messages } = get()
    if (!currentChatId) throw new Error('No chat selected')

    const userMessage: Message = {
      role: 'user',
      content,
    }

    set({ messages: [...messages, userMessage], isGenerating: true })

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId,
          content,
          role: 'user',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        message.error(error.error || '保存消息失败')
        throw new Error(error.error || '保存消息失败')
      }

      const { userMessage: savedUserMessage, assistantMessage } = await response.json()
      set(state => ({
        messages: [...state.messages, savedUserMessage, assistantMessage],
        chats: state.chats.map(chat => 
          chat.id === currentChatId
            ? {
                ...chat,
                title: chat.messages.length === 0 ? content.slice(0, 50) : chat.title,
                messages: [...chat.messages, savedUserMessage, assistantMessage]
              }
            : chat
        ),
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    } finally {
      set({ isGenerating: false })
    }
  },

  stopGeneration: () => {
    // TODO: Implement actual stopping of generation
    set({ isGenerating: false })
  },
}))
