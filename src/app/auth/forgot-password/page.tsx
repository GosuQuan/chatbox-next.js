'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Card, App } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [emailSent, setEmailSent] = useState(false)

  const onFinish = async (values: { email: string }) => {
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
        setEmailSent(true)
        message.success('重置密码邮件已发送！')
      } else {
        hide()
        message.error(data.error || '发送失败')
      }
    } catch (error) {
      hide()
      console.error('Forgot password error:', error)
      message.error('网络错误，请检查网络连接后重试')
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
          title="忘记密码" 
          style={{ 
            width: 400,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          {!emailSent ? (
            <Form
              name="forgot-password"
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
                  prefix={<MailOutlined />} 
                  placeholder="请输入您的注册邮箱" 
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
                  发送重置邮件
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Link href="/auth/login">返回登录</Link>
              </div>
            </Form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '16px' }}>
                重置密码邮件已发送到您的邮箱
              </p>
              <p style={{ marginBottom: '16px' }}>
                请在30分钟内点击邮件中的链接完成密码重置
              </p>
              <Link href="/auth/login">返回登录</Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
