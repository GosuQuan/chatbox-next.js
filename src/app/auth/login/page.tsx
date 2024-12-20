'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Form, Input, Button, message, App, Card } from 'antd'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

export default function LoginPage() {
  const router = useRouter()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const resetState = useChatStore(state => state.resetState)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 在登录前重置状态
      resetState()

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

      message.success('登录成功')
      router.push('/chat')
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          title="登录" 
          style={{ 
            width: 400,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Form
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="邮箱" size="large" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              还没有账号？ <Link href="/auth/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  )
}
