'use client'

import { useStore } from '@/store/useStore'
import { Button, Card, Space, Typography } from 'antd'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title } = Typography

export default function CounterPage() {
  const { count, increment, decrement, reset } = useStore()

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Title level={2}>Zustand Counter</Title>
        
        <Title level={1} style={{ margin: '24px 0' }}>
          {count}
        </Title>
        
        <Space size="middle">
          <Button 
            type="primary" 
            danger 
            icon={<MinusOutlined />} 
            onClick={decrement}
            size="large"
          >
            Decrease
          </Button>
          
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={increment}
            size="large"
          >
            Increase
          </Button>
          
          <Button 
            icon={<ReloadOutlined />}
            onClick={reset}
            size="large"
          >
            Reset
          </Button>
        </Space>
      </Card>
    </div>
  )
}
