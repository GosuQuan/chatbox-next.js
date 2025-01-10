'use client';

import React from 'react';
import { Card, Tabs, Table, Typography, Tag, Space, Divider, Alert } from 'antd';
import { HttpMethodTag } from './components/HttpMethodTag';
import { CodeBlock } from './components/CodeBlock';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// API 端点数据
const endpoints = [
  {
    method: 'GET',
    path: '/api/todos',
    title: '获取所有待办事项',
    description: '获取当前用户的所有待办事项列表',
  },
  {
    method: 'POST',
    path: '/api/todos',
    title: '创建待办事项',
    description: '创建一个新的待办事项',
  },
  {
    method: 'PUT',
    path: '/api/todos/:id',
    title: '更新待办事项',
    description: '更新指定 ID 的待办事项',
  },
  {
    method: 'DELETE',
    path: '/api/todos/:id',
    title: '删除待办事项',
    description: '删除指定 ID 的待办事项',
  },
];

// 请求参数列的配置
const paramColumns = [
  {
    title: '参数名',
    dataIndex: 'name',
    key: 'name',
    width: '20%',
    render: (text: string) => <Text code>{text}</Text>,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: '15%',
    render: (text: string) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: '是否必需',
    dataIndex: 'required',
    key: 'required',
    width: '15%',
    render: (required: boolean) => (
      <Tag color={required ? 'red' : 'green'}>{required ? '是' : '否'}</Tag>
    ),
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
];

export default function ApiDocs() {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#f5f5f5'
    }}>
      <Card style={{ marginBottom: '40px' }}>
        <Typography>
          <Title level={1} style={{ marginBottom: '24px' }}>API 文档</Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: '0' }}>
            欢迎使用待办事项 API。本文档详细介绍了所有可用的 API 端点及其用法。
          </Paragraph>
        </Typography>
      </Card>

      <Card 
        style={{ 
          marginBottom: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Title level={3} style={{ marginBottom: '24px' }}>认证说明</Title>
        <Alert
          message={
            <Text strong>所有 API 请求都需要在 Header 中包含有效的 Bearer Token</Text>
          }
          description={
            <div style={{ marginTop: '16px' }}>
              <Text>请在每个请求的 Header 中添加：</Text>
              <CodeBlock code="Authorization: Bearer {your_token}" />
            </div>
          }
          type="info"
          showIcon
          style={{ border: '1px solid #91caff' }}
        />
      </Card>

      <Title level={2} style={{ margin: '40px 0 24px' }}>API 端点</Title>

      {endpoints.map((endpoint) => (
        <Card 
          key={endpoint.path} 
          style={{ 
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Space size="middle" align="center">
                <HttpMethodTag method={endpoint.method} />
                <Text code style={{ fontSize: '16px' }}>{endpoint.path}</Text>
              </Space>
              
              <Title level={4} style={{ margin: '24px 0 8px' }}>{endpoint.title}</Title>
              <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
                {endpoint.description}
              </Paragraph>
            </div>

            <Tabs 
              defaultActiveKey="1"
              type="card"
              style={{ 
                background: '#fafafa',
                padding: '24px',
                borderRadius: '8px'
              }}
            >
              <TabPane tab="请求参数" key="1">
                {endpoint.method === 'GET' && (
                  <Table
                    dataSource={[
                      {
                        name: 'completed',
                        type: 'boolean',
                        required: false,
                        description: '根据完成状态筛选（可选）',
                      },
                    ]}
                    columns={paramColumns}
                    pagination={false}
                    style={{ marginTop: '16px' }}
                  />
                )}
                
                {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
                  <Table
                    dataSource={[
                      {
                        name: 'text',
                        type: 'string',
                        required: endpoint.method === 'POST',
                        description: '待办事项内容',
                      },
                      {
                        name: 'completed',
                        type: 'boolean',
                        required: false,
                        description: '完成状态',
                      },
                    ]}
                    columns={paramColumns}
                    pagination={false}
                    style={{ marginTop: '16px' }}
                  />
                )}

                {endpoint.method === 'DELETE' && (
                  <Table
                    dataSource={[
                      {
                        name: 'id',
                        type: 'string',
                        required: true,
                        description: '待删除的待办事项 ID',
                      },
                    ]}
                    columns={paramColumns}
                    pagination={false}
                    style={{ marginTop: '16px' }}
                  />
                )}
              </TabPane>

              <TabPane tab="响应示例" key="2">
                <Tabs 
                  defaultActiveKey="success"
                  style={{ marginTop: '16px' }}
                >
                  <TabPane tab="成功响应" key="success">
                    <div style={{ marginTop: '16px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {endpoint.method !== 'DELETE' && (
                          <Text type="success">
                            {endpoint.method === 'POST' ? '201 Created' : '200 OK'}
                          </Text>
                        )}
                        {endpoint.method === 'DELETE' && (
                          <Text type="success">204 No Content</Text>
                        )}
                        <CodeBlock
                          code={
                            endpoint.method === 'GET'
                              ? `{
  "todos": [
    {
      "id": "123",
      "text": "买菜",
      "completed": false,
      "createdAt": "2024-01-08T10:00:00Z"
    }
  ]
}`
                              : endpoint.method === 'POST'
                              ? `{
  "id": "123",
  "text": "买菜",
  "completed": false,
  "createdAt": "2024-01-08T10:00:00Z"
}`
                              : endpoint.method === 'PUT'
                              ? `{
  "id": "123",
  "text": "买菜和水果",
  "completed": true,
  "updatedAt": "2024-01-08T11:00:00Z"
}`
                              : '// 204 No Content'
                          }
                        />
                      </Space>
                    </div>
                  </TabPane>
                  <TabPane tab="错误响应" key="error">
                    <div style={{ marginTop: '16px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="danger">
                          {endpoint.method === 'POST'
                            ? '400 Bad Request'
                            : endpoint.method === 'PUT' || endpoint.method === 'DELETE'
                            ? '404 Not Found'
                            : '401 Unauthorized'}
                        </Text>
                        <CodeBlock
                          code={`{
  "error": "${
    endpoint.method === 'POST'
      ? 'ValidationError'
      : endpoint.method === 'PUT' || endpoint.method === 'DELETE'
      ? 'NotFound'
      : 'Unauthorized'
  }",
  "message": "${
    endpoint.method === 'POST'
      ? '缺少必需的字段'
      : endpoint.method === 'PUT' || endpoint.method === 'DELETE'
      ? '找不到指定的待办事项'
      : '无效的认证令牌'
  }"
}`}
                        />
                      </Space>
                    </div>
                  </TabPane>
                </Tabs>
              </TabPane>
            </Tabs>
          </Space>
        </Card>
      ))}
    </div>
  );
}
