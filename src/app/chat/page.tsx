'use client'

import { useEffect, useState, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { Button, Input, Layout, List, Typography, Avatar, Card } from 'antd'
import { SendOutlined, StopOutlined, UserOutlined, RobotOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import WelcomeOverlay from '@/components/WelcomeOverlay'
import MessageContent from '@/components/MessageContent'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    messages, 
    chats,
    currentChatId, 
    createChat, 
    setCurrentChat, 
    deleteChat,
    sendMessage,
    stopGeneration,
    isGenerating: isLoading,
    loadMessages,
    loadChats
  } = useChatStore()

  useEffect(() => {
    const initializeChat = async () => {
      await loadChats()
      if (!currentChatId && chats.length === 0) {
        await createChat()
      } else if (currentChatId) {
        await loadMessages(currentChatId)
      }
    }

    initializeChat()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(message)
  }

  const handleStopGeneration = () => {
    stopGeneration()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={300} theme="light" style={{ 
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto'
      }}>
        <div style={{ padding: '16px' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={createChat}
            block
          >
            新对话
          </Button>
        </div>

        <List
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              style={{ 
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: chat.id === currentChatId ? '#f0f0f0' : 'transparent'
              }}
              onClick={() => setCurrentChat(chat.id)}
              actions={[
                <DeleteOutlined 
                  key="delete" 
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(chat.id)
                  }}
                />
              ]}
            >
              <Text ellipsis>{chat.title}</Text>
            </List.Item>
          )}
        />
      </Sider>

      <Layout>
        <Content style={{ 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          <WelcomeOverlay />
          <div style={{ 
            flex: 1, 
            overflow: 'auto', 
            marginBottom: '24px',
            padding: '0 16px'
          }}>
            <List
              dataSource={messages}
              renderItem={(message, index) => (
                <List.Item key={index}>
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Avatar
                      icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a',
                        margin: '0 12px',
                      }}
                    />
                    <Card
                      style={{
                        maxWidth: '80%',
                        backgroundColor: message.role === 'user' ? '#e6f7ff' : '#f0f0f0',
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <Typography.Text>
                        <MessageContent content={message.content} />
                      </Typography.Text>
                    </Card>
                  </div>
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '0 16px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="输入消息..."
                disabled={isLoading}
                size="large"
              />
              {isLoading ? (
                <Button
                  type="primary"
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopGeneration}
                  size="large"
                >
                  停止生成
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  htmlType="submit"
                  disabled={!inputMessage.trim()}
                  size="large"
                >
                  发送
                </Button>
              )}
            </form>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
