import React from 'react';
import { Tabs, Modal, App } from 'antd';
import { ModelType } from '@/config/api';
import { useChatStore } from '@/store/chatStore';
import styles from './ModelSelector.module.css';

const ModelSelector: React.FC = () => {
  const { message, modal } = App.useApp();
  const { 
    currentModelType, 
    setModelType, 
    messages,
    createChat,
    setCurrentChat
  } = useChatStore();

  const handleModelChange = async (value: string) => {
    const newModelType = value as ModelType;
    
    // If there are messages in the current chat, show confirmation dialog
    if (messages.length > 0) {
      modal.confirm({
        title: '切换模型',
        content: '切换模型将开启新的对话，当前对话的上下文将会丢失，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          try {
            // 先设置新的模型类型
            setModelType(newModelType);
            // 创建新对话并清空消息
            const newChatId = await createChat();
            // 直接设置空消息列表，避免加载动画
            setCurrentChat(newChatId);
            message.success(`已切换至${newModelType === ModelType.DOUPACK ? '豆包' : 'DeepSeek'}模型`);
          } catch (error) {
            message.error('创建新对话失败');
          }
        },
      });
    } else {
      // If no messages, just switch the model
      setModelType(newModelType);
      message.success(`已切换至${newModelType === ModelType.DOUPACK ? '豆包' : 'DeepSeek'}模型`);
    }
  };

  const items = [
    {
      key: ModelType.DOUPACK,
      label: '豆包模型',
    },
    {
      key: ModelType.DEEPSEEK,
      label: 'DeepSeek模型',
    },
  ];

  return (
    <div className={styles.modelSelectorWrapper}>
      <Tabs
        activeKey={currentModelType}
        onChange={handleModelChange}
        items={items}
        className={styles.modelSelector}
      />
    </div>
  );
};

export default ModelSelector;
