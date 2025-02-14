'use client'

import { App, Button, Form, Input, Card, Result } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const token = searchParams.get('token')
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  
  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    // 检查重置链接是否有效
    const checkToken = async () => {
      try {
        const response = await fetch('/api/auth/check-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          setIsValidToken(false)
          return
        }

        setIsValidToken(true)
      } catch (error) {
        console.error('Check token error:', error)
        setIsValidToken(false)
      }
    }

    checkToken()
  }, [token, router])

  const onFinish = async (values: ResetPasswordForm) => {
    if (loading) return
    
    const hide = message.loading('重置密码中...')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
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
        message.error(data.error || '重置失败，请稍后重试')
      }
    } catch (error) {
      hide()
      message.error('重置失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (!token || isValidToken === null) {
    return null
  }

  if (!isValidToken) {
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
          <Result
            status="404"
            title="链接已失效"
            subTitle="您的重置密码链接已失效或已被使用，请重新申请重置密码。"
            extra={
              <Button 
                type="primary" 
                onClick={() => router.push('/auth/forgot-password')}
                size="large"
              >
                重新申请
              </Button>
            }
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </motion.div>
      </div>
    )
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
          title="重置密码" 
          style={{ 
            width: 400,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Form
            form={form}
            name="reset-password"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度不能小于6位' }
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large" 
                placeholder="请输入新密码" 
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large" 
                placeholder="请再次输入新密码" 
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
                重置密码
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
