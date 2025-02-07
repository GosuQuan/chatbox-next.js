import React from 'react';
import { Select } from 'antd';
import { ModelType } from '@/config/api';
import { useChatStore } from '@/store/chatStore';

const { Option } = Select;

const ModelSelector: React.FC = () => {
  const { currentModelType, setModelType } = useChatStore();

  const handleModelChange = (value: ModelType) => {
    console.log('Selected model:', value);
    setModelType(value);
  };

  return (
    <Select
      value={currentModelType}
      onChange={handleModelChange}
      style={{ width: 200 }}
      className="mb-4"
    >
      <Option value={ModelType.DOUPACK}>豆包模型</Option>
      <Option value={ModelType.DEEPSEEK}>DeepSeek模型</Option>
    </Select>
  );
};

export default ModelSelector;
