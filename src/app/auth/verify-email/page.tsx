'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Result } from 'antd'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // 处理验证逻辑
  const handleVerify = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        router.push('/auth/login')
      } else {
        console.error('验证失败')
      }
    } catch (error) {
      console.error('验证失败', error)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Result
          status="success"
          title="邮箱验证成功"
          subTitle="您的邮箱已验证成功，现在可以登录了。"
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => router.push('/auth/login')}
            >
              前往登录
            </Button>,
          ]}
        />
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}