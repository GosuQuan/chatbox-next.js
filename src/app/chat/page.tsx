'use client'

import { useEffect } from 'react'
import { App, Layout, Button, Input, List, Avatar } from 'antd'
import { SendOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useChatStore } from '@/store/chatStore'

const { Header, Sider, Content } = Layout

export default function ChatPage() {
  const { message } = App.useApp()
  const {
    chats,
    currentChatId,
    messages,
    isGenerating,
    loadChats,
    createChat,
    setCurrentChat,
    deleteChat,
    sendMessage,
    stopGeneration,
  } = useChatStore()

  useEffect(() => {
    loadChats().catch(error => {
      message.error(error.message)
    })
  }, [loadChats, message])

  const handleSend = async (content: string) => {
    if (!content.trim()) return
    
    try {
      if (!currentChatId) {
        await createChat()
      }
      await sendMessage(content)
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    }
  }

  const handleDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      message.success('删除成功')
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    }
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={300} theme="light" style={{ padding: '20px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => createChat()}
          style={{ width: '100%', marginBottom: '20px' }}
        >
          新建对话
        </Button>
        
        <List
          dataSource={chats}
          renderItem={chat => (
            <List.Item
              key={chat.id}
              onClick={() => setCurrentChat(chat.id)}
              style={{
                cursor: 'pointer',
                backgroundColor: currentChatId === chat.id ? '#f0f0f0' : 'transparent',
                padding: '10px',
                borderRadius: '4px',
              }}
              actions={[
                <Button
                  key="delete"
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(chat.id)
                  }}
                />
              ]}
            >
              {chat.title}
            </List.Item>
          )}
        />
      </Sider>
      
      <Layout>
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
            <List
              dataSource={messages}
              renderItem={msg => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a'
                        }}
                      >
                        {msg.role === 'user' ? 'U' : 'A'}
                      </Avatar>
                    }
                    content={msg.content}
                  />
                </List.Item>
              )}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input.TextArea
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 6 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  handleSend((e.target as HTMLTextAreaElement).value)
                  ;(e.target as HTMLTextAreaElement).value = ''
                }
              }}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={isGenerating}
              onClick={() => {
                const input = document.querySelector('textarea')
                if (input) {
                  handleSend(input.value)
                  input.value = ''
                }
              }}
            >
              发送
            </Button>
            {isGenerating && (
              <Button onClick={stopGeneration}>
                停止生成
              </Button>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
