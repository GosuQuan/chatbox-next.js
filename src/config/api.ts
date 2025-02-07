export enum ModelType {
  DOUPACK = 'doupack',
  DEEPSEEK = 'deepseek'
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
  [ModelType.DEEPSEEK]: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.DASHSCOPE_API_KEY || '',
    model: 'deepseek-r1-distill-qwen-7b',
    systemPrompt: 'You are a helpful assistant.'
  }
}

export const getModelConfig = (modelType: ModelType): ModelConfig => {
  return MODEL_CONFIGS[modelType];
}
