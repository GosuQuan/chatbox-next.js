export enum ModelType {
  DOUPACK = 'doupack',
  DEEPSEEKR1 = 'deepseekr1'
}

type ModelConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
}

const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  [ModelType.DOUPACK]: {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: process.env.ARK_API_KEY || '',
    model: 'ep-20240708031540-z8w8q',
    systemPrompt: '你是豆包，是由字节跳动开发的 AI 人工智能助手'
  },
  [ModelType.DEEPSEEKR1]: {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: process.env.ARK_API_KEY || '',
    model: 'ep-20250212112539-vgpn2',
    systemPrompt: '简单直接，你是一名出众的推理大师，能深入浅出地解读复杂的问题，你是 DeepSeekR1'
  }
}

export const getModelConfig = (modelType: ModelType): ModelConfig => {
  return MODEL_CONFIGS[modelType];
}

export const sendMessage = async (
  messages: any[],
  modelType: ModelType,
  signal?: AbortSignal
): Promise<string> => {
  const modelConfig = getModelConfig(modelType);
  const response = await fetch(`${modelConfig.baseURL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apiKey': modelConfig.apiKey,
    },
    body: JSON.stringify({ messages, model: modelConfig.model }),
    signal, // 添加 AbortSignal
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '发送消息失败');
  }

  const data = await response.json();
  return data.message;
};
