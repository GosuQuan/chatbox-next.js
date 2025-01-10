import React from 'react';
import { Tag } from 'antd';

interface HttpMethodTagProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

const methodColors = {
  GET: '#389e0d',    // 深绿色
  POST: '#1890ff',   // 蓝色
  PUT: '#d48806',    // 深黄色
  DELETE: '#cf1322', // 深红色
};

export const HttpMethodTag: React.FC<HttpMethodTagProps> = ({ method }) => {
  return (
    <Tag
      color={methodColors[method]}
      style={{
        borderRadius: '4px',
        padding: '4px 12px',
        fontSize: '14px',
        fontWeight: 500,
        margin: 0,
      }}
    >
      {method}
    </Tag>
  );
};
