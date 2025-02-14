'use client'

import { App, Button, Form, Input } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            找回密码
          </h2>
        </div>
        <Form
          form={form}
          name="forgot-password"
          onFinish={onFinish}
          layout="vertical"
          className="mt-8 space-y-6"
        >
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input size="large" placeholder="请输入您的邮箱地址" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full"
            >
              发送重置邮件
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
              返回登录
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}
