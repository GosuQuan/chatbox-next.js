import React from 'react';
import { Typography } from 'antd';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  return (
    <pre
      style={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderRadius: '6px',
        margin: '8px 0',
        overflow: 'auto',
        fontSize: '14px',
        fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      }}
    >
      <code>{code}</code>
    </pre>
  );
};
