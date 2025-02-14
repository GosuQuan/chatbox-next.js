'use client'

import { Button, Result } from 'antd'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function NotFound() {
  const router = useRouter()

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
