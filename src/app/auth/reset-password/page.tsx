'use client'

import { App, Button, Form, Input } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

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
  
  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
    }
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

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            重置密码
          </h2>
        </div>
        <Form
          form={form}
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          className="mt-8 space-y-6"
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能小于6位' }
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
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
            <Input.Password size="large" placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full"
            >
              重置密码
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
