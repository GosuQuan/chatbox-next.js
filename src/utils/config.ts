interface AppConfig {
  appUrl: string;
}

function getAppConfig(): AppConfig {
  // 首先尝试使用环境变量
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return { appUrl: envUrl };
  }

  // 根据 NODE_ENV 返回不同的配置
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        appUrl: 'https://gosuquan.tech',
      };
    case 'development':
      return {
        appUrl: 'http://localhost:3000',
      };
    default:
      return {
        appUrl: 'http://localhost:3000',
      };
  }
}

export const config = getAppConfig();
