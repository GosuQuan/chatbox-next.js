import { ModelType } from '@/config/api'

export interface Message {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  chatId?: string
  createdAt?: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  lastMessageTime?: number
  userId?: string
  modelType?: ModelType
}
