import { create } from 'zustand'
import { Message } from '@/types/chat'
import { message as antMessage } from 'antd'
import { ModelType } from '@/config/api'

interface Chat {
  id: string
  title: string
  messages: Message[]
  modelType?: ModelType
}

interface ChatStore {
  messages: Message[]
  chats: Chat[]
  currentChatId: string | null
  currentModelType: ModelType
  isGenerating: boolean
  abortController: AbortController | null
  timeoutId: NodeJS.Timeout | null
  createChat: () => Promise<string>
  loadChats: () => Promise<void>
  setCurrentChat: (chatId: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  stopGeneration: () => void
  loadMessages: (chatId: string) => Promise<void>
  setModelType: (modelType: ModelType) => void
  getCurrentChat: () => Chat | null
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  chats: [],
  currentChatId: null,
  currentModelType: ModelType.DOUPACK,
  isGenerating: false,
  abortController: null,
  timeoutId: null,

  createChat: async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
          modelType: get().currentModelType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        antMessage.error(error.error || '创建聊天失败')
        throw new Error(error.error || '创建聊天失败')
      }

      const chat = await response.json()
      set(state => ({ 
        chats: [...state.chats, { ...chat, title: '新对话' }]
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
        antMessage.error(error.error || '加载聊天列表失败')
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
    try {
      // 先加载消息
      await get().loadMessages(chatId)
      // 加载成功后再设置当前对话
      set({ currentChatId: chatId })
    } catch (error) {
      console.error('Error setting current chat:', error)
      antMessage.error('加载消息失败')
      throw error
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        antMessage.error(error.error || '删除聊天失败')
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
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    
    set({ isGenerating: true, abortController: controller });

    try {
      // 保存用户消息到数据库
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: get().currentChatId,
          content,
          role: 'user'
        })
      });

      const newMessages = [
        ...get().messages, 
        { role: 'user', content },
        { role: 'assistant', content: '思考中...' } 
      ];
      set({ messages: newMessages });

      // 更新当前对话的标题
      const { currentChatId, chats } = get();
      const currentChat = chats.find(chat => chat.id === currentChatId);
      
      if (currentChatId && currentChat?.title === '新对话') {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === currentChatId
              ? { ...chat, title: content.slice(0, 8) }
              : chat
          )
        }));
      }

      // 设置10秒超时
      timeoutId = setTimeout(() => {
        controller.abort();
        set({ 
          messages: newMessages.slice(0, -1).concat({ 
            role: 'assistant', 
            content: '服务器繁忙，请稍后再试。' 
          }),
          isGenerating: false,
          abortController: null,
          timeoutId: null
        });
      }, 100000);

      set({ timeoutId });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.slice(0, -1),
          chatId: get().currentChatId,
          modelType: get().currentModelType
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '发送消息失败');
      }

      // 清除超时定时器，因为已经收到响应
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let assistantMessage = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  assistantMessage += content;

                  // 更新UI显示
                  set({
                    messages: newMessages.slice(0, -1).concat({
                      role: 'assistant',
                      content: assistantMessage
                    })
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE message:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // 保存 AI 的完整回复到数据库
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: get().currentChatId,
          content: assistantMessage,
          role: 'assistant'
        })
      });

      // 完成后设置最终状态
      set({
        messages: newMessages.slice(0, -1).concat({
          role: 'assistant',
          content: assistantMessage
        }),
        isGenerating: false,
        abortController: null,
        timeoutId: null
      });
    } catch (error) {
      console.log("错误详情：", {
        message: error.message,
        response: error.response,
        stack: error.stack
      });

      // 清除超时定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error.name === 'AbortError') {
        if (get().timeoutId === null) {
          // 用户手动停止，移除思考中的消息
          set({ 
            messages: get().messages.slice(0, -1),
            isGenerating: false, 
            abortController: null,
            timeoutId: null 
          });
        }
        return;
      }
      
      // 其他错误，替换思考中的消息为错误消息
      set({ 
        messages: get().messages.slice(0, -1).concat({ 
          role: 'assistant', 
          content: '发送消息失败，请重试。' 
        }),
        isGenerating: false,
        abortController: null,
        timeoutId: null
      });
    }
  },

  stopGeneration: () => {
    const { abortController, timeoutId } = get();
    if (abortController) {
      abortController.abort();
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    set({ 
      isGenerating: false, 
      abortController: null,
      timeoutId: null 
    });
  },

  setModelType: (modelType: ModelType) => {
    set({ currentModelType: modelType })
    // 更新当前聊天的模型类型
    const currentChat = get().getCurrentChat()
    if (currentChat) {
      set(state => ({
        chats: state.chats.map(chat =>
          chat.id === currentChat.id
            ? { ...chat, modelType }
            : chat
        )
      }))
    }
  },

  getCurrentChat: () => {
    const { chats, currentChatId } = get()
    return chats.find(chat => chat.id === currentChatId) || null
  },
}))
