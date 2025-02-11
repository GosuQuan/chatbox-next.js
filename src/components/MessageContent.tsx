import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import { ReactNode } from 'react'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface MessageContentProps {
  content: string
  isGenerating?: boolean
}

export default function MessageContent({ content, isGenerating }: MessageContentProps) {
  const [messageApi, contextHolder] = message.useMessage()
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})

  const getTextContent = (children: ReactNode): string => {
    if (typeof children === 'string') return children
    if (Array.isArray(children)) return children.map(getTextContent).join('')
    if (children === null || children === undefined) return ''
    if (typeof children === 'number') return children.toString()
    if (typeof children === 'boolean') return ''
    if ('props' in children && 'children' in children.props) {
      return getTextContent(children.props.children)
    }
    return ''
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMap(prev => ({ ...prev, [id]: true }))
      messageApi.success('代码已复制到剪贴板')
      setTimeout(() => {
        setCopiedMap(prev => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (err) {
      messageApi.error('复制失败，请重试')
    }
  }

  return (
    <div className="markdown-body">
      {contextHolder}
      <div style={{ position: 'relative' }}>
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            pre: ({ node, children, ...props }) => {
              const codeContent = getTextContent(children)
              const id = Math.random().toString(36).substring(7)
              const isCopied = copiedMap[id]

              return (
                <div style={{ position: 'relative' }}>
                  <pre
                    style={{ 
                      background: '#1E1E1E',
                      padding: '1rem',
                      paddingTop: '2rem',
                      borderRadius: '4px',
                      overflow: 'auto'
                    }}
                    {...props}
                  >
                    {children}
                  </pre>
                  <button
                    onClick={() => handleCopy(codeContent, id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                  >
                    {isCopied ? (
                      <>
                        <CheckOutlined /> 已复制
                      </>
                    ) : (
                      <>
                        <CopyOutlined /> 复制代码
                      </>
                    )}
                  </button>
                </div>
              )
            },
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              const language = match ? match[1] : ''
              const code = getTextContent(children).replace(/\n$/, '')
　　 　 　 　
              if (!inline && language) {
                try {
                  const highlightedCode = hljs.highlight(code, {
                    language,
                    ignoreIllegals: true
                  }).value

                  return (
                    <code
                      className={className}
                      dangerouslySetInnerHTML={{ __html: highlightedCode }}
                      style={{
                        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                      }}
                      {...props}
                    />
                  )
                } catch (error) {
                  console.error('Failed to highlight code:', error)
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }

              return (
                <code
                  className={className}
                  style={{ 
                    background: '#f0f0f0',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '3px',
                    fontSize: '0.875em',
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  }}
                  {...props}
                >
                  {children}
                </code>
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
        {isGenerating && (
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            marginLeft: '8px',
            position: 'absolute'
          }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
          </div>
        )}
      </div>
    </div>
  )
}
