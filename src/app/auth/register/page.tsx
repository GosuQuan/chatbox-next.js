'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Form, Input, App } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  verifyCode: string
}

export default function RegisterPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { message } = App.useApp()

  const startCountdown = (seconds: number = 30) => {
    setCountdown(seconds)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendVerifyCode = async (isResend = false) => {
    try {
      const email = form.getFieldValue('email')
      if (!email) {
        message.error('请输入邮箱地址')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        message.error('请输入有效的邮箱地址')
        return
      }

      setSendingCode(true)
      const response = await fetch(
        isResend ? '/api/auth/resend-verify-code' : '/api/auth/send-verify-code', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        message.success('验证码已发送，请查收')
        startCountdown(30) // 30秒后可以重新发送
      } else {
        if (data.remainingSeconds) {
          message.info('验证码仍然有效，请等待' + data.remainingSeconds + '秒后再试')
          startCountdown(30) // 如果验证码还有效，也可以30秒后重新发送
        } else {
          message.error(data.error || '发送验证码失败')
        }
      }
    } catch (error) {
      console.error('Send verify code error:', error)
      message.error('发送验证码失败')
    } finally {
      setSendingCode(false)
    }
  }

  const onFinish = async (values: RegisterForm) => {
    if (loading) return
    
    const hide = message.loading('注册中...')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      
      if (response.ok) {
        hide()
        message.success('注册成功！')
        setTimeout(() => {
          router.push('/auth/login')
        }, 1000)
      } else {
        hide()
        message.error(data.error || '注册失败')
      }
    } catch (error) {
      hide()
      console.error('Registration error:', error)
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
        padding: '20px',
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#1a202c',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          注册账号
        </h1>

        <Form
          form={form}
          name="register"
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
              placeholder="邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="verifyCode"
            rules={[
              { required: true, message: '请输入验证码' },
              { len: 6, message: '验证码长度应为6位' }
            ]}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input 
                placeholder="验证码"
                size="large"
              />
              <Button
                type="primary"
                size="large"
                onClick={() => sendVerifyCode(true)}
                loading={sendingCode}
                disabled={countdown > 0}
              >
                {countdown > 0 
                  ? `${countdown}秒`
                  : sendingCode 
                    ? '发送中'
                    : '获取验证码'
                }
              </Button>
            </div>
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
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
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              size="large"
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？
            <Link href="/auth/login" style={{ marginLeft: '4px' }}>
              立即登录
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
};
