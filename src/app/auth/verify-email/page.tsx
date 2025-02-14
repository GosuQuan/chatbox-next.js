'use client'

import { App } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const { message } = App.useApp()

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      message.error('无效的验证链接')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          message.success('邮箱验证成功！')
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        } else {
          message.error(data.error || '验证失败，请重试')
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        }
      } catch (error) {
        console.error('Verification error:', error)
        message.error('验证失败，请重试')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router, message])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            邮箱验证
          </h2>
          <p className="text-gray-600">
            {verifying ? '正在验证您的邮箱...' : '验证完成，即将跳转到登录页面'}
          </p>
        </div>
      </div>
    </div>
  )
}
