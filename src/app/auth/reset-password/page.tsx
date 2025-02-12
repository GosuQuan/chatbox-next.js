'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Card, App } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const token = searchParams.get('token')

  const onFinish = async (values: ResetPasswordForm) => {
    if (loading) return
    if (!token) {
      message.error('无效的重置链接')
      return
    }
    
    const hide = message.loading('重置中...')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        hide()
        message.success('密码重置成功！')
        setTimeout(() => {
          router.push('/auth/login')
        }, 1000)
      } else {
        hide()
        message.error(data.error || '重置失败')
      }
    } catch (error) {
      hide()
      console.error('Reset password error:', error)
      message.error('网络错误，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const validateConfirmPassword = (_: any, value: string) => {
    const { getFieldValue } = form
    if (!value || getFieldValue('password') === value) {
      return Promise.resolve()
    }
    return Promise.reject(new Error('两次输入的密码不一致'))
  }

  const [form] = Form.useForm()

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
          title="重置密码" 
          style={{ 
            width: 400,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          {!token ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '16px' }}>
                无效的重置链接，请重新发起密码重置请求
              </p>
              <Link href="/auth/forgot-password">重新发送重置邮件</Link>
            </div>
          ) : (
            <Form
              form={form}
              name="reset-password"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少为6位' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="新密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  { validator: validateConfirmPassword }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认新密码"
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
                  重置密码
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Link href="/auth/login">返回登录</Link>
              </div>
            </Form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
