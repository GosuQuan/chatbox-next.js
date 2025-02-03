/** @type {import('next').NextConfig} */
const nextConfig = {
  // 在生产构建时忽略 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 在生产构建时忽略 TypeScript 错误
  typescript: {
    ignoreBuildErrors: true
  },
  // 确保环境变量在构建时可用
  serverRuntimeConfig: {
    ARK_API_KEY: process.env.ARK_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  publicRuntimeConfig: {
    // 这里添加可以公开的配置
    apiBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3'
  },
  // 输出更多构建信息
  logging: {
    fetches: {
      fullUrl: true,
    },
  }
}

module.exports = nextConfig
