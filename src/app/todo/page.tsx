'use client'

import { useStore } from '@/store/useStore'
import { Button, Card, Input, List, Typography, Spin, message } from 'antd'
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'

const { Title } = Typography

export default function TodoPage() {
  const { 
    todos, 
    isLoading,
    error,
    fetchTodos,
    addTodo, 
    toggleTodo, 
    removeTodo 
  } = useStore()
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      await addTodo(newTodo.trim())
      setNewTodo('')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      background: '#f0f2f5'
    }}>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Todo List
        </Title>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Input 
            placeholder="添加新任务..." 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onPressEnter={handleAddTodo}
            disabled={isLoading}
          />
          <Button 
            type="primary" 
            onClick={handleAddTodo}
            loading={isLoading}
          >
            添加
          </Button>
        </div>

        <Spin spinning={isLoading}>
          <List
            itemLayout="horizontal"
            dataSource={todos}
            renderItem={(todo) => (
              <List.Item
                actions={[
                  <Button 
                    key="toggle"
                    type={todo.completed ? 'primary' : 'default'}
                    icon={<CheckOutlined />}
                    onClick={() => toggleTodo(todo.id)}
                    loading={isLoading}
                  />,
                  <Button 
                    key="delete"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeTodo(todo.id)}
                    loading={isLoading}
                  />
                ]}
              >
                <List.Item.Meta
                  title={
                    <span style={{ 
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#888' : 'inherit'
                    }}>
                      {todo.text}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Card>
    </div>
  )
}
