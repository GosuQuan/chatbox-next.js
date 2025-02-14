'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Card, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

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
        // 如果是未验证邮箱，显示特殊提示并提供重新发送验证邮件的选项
        if (data.needVerification) {
          const resendVerification = async () => {
            try {
              const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
              });
              
              const resendData = await response.json();
              
              if (response.ok) {
                message.success('验证邮件已重新发送，请查收');
              } else {
                message.error(resendData.error || '发送验证邮件失败');
              }
            } catch (error) {
              console.error('Resend verification error:', error);
              message.error('发送验证邮件失败');
            }
          };

          App.Modal.confirm({
            title: '邮箱未验证',
            content: '您的邮箱还未验证，需要重新发送验证邮件吗？',
            okText: '重新发送',
            cancelText: '取消',
            onOk: resendVerification
          });
        } else {
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

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500">
                忘记密码？
              </Link>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              还没有账号？ <Link href="/auth/register">立即注册</Link>
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
