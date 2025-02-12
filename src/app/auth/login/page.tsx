'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Card, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import RippleBackground from '@/components/RippleBackground'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const onFinish = async (values: LoginForm) => {
    if (loading) return
    
    const hide = message.loading('登录中...')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      
      if (response.ok) {
        hide()
        message.success('登录成功！')
        setTimeout(() => {
          router.push('/chat')
        }, 1000)
      } else {
        hide()
        message.error(data.error || '登录失败')
        // 如果是密码错误，清空密码输入
        if (data.error?.includes('密码错误') || data.error?.includes('账号或密码错误')) {
          form.setFields([
            {
              name: 'password',
              value: '',
            },
          ])
        }
      }
    } catch (error) {
      hide()
      console.error('Login error:', error)
      message.error('网络错误，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative'
      }}
    >
      <RippleBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          title="登录" 
          style={{ 
            width: 400,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="邮箱" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少为6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800">
                忘记密码？
              </Link>
            </div>
            <div style={{ textAlign: 'center' }}>
              还没有账号？ <Link href="/auth/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  )
}
