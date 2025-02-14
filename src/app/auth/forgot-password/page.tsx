'use client'

import { App, Button, Form, Input, Card } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { UserOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const onFinish = async (values: ForgotPasswordForm) => {
    if (loading) return
    
    const hide = message.loading('发送中...')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      
      if (response.ok) {
        hide()
        message.success('重置密码邮件已发送，请检查您的邮箱！')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        hide()
        message.error(data.error || '发送失败，请稍后重试')
      }
    } catch (error) {
      hide()
      message.error('发送失败，请稍后重试')
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
          title="找回密码" 
          style={{ 
            width: 400,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Form
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                size="large" 
                placeholder="请输入您的邮箱地址" 
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                发送重置邮件
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
                返回登录
              </Link>
            </div>
            <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
              联系电话：<a href="tel:18888888888" style={{ color: '#1890ff' }}>188-8888-8888</a>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  )
}
