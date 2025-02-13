/** @type {import('next').NextConfig} */

// 打印环境变量状态
console.log('Next.js Config - Environment Variables Status:');
console.log('ARK_API_KEY exists:', !!process.env.ARK_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

const nextConfig = {
  // 在生产构建时忽略 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 在生产构建时忽略 TypeScript 错误
  typescript: {
    ignoreBuildErrors: true
  },
  // 确保环境变量在所有阶段可用
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    ARK_API_KEY: process.env.ARK_API_KEY,
  },
  // 服务器运行时配置
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    ARK_API_KEY: process.env.ARK_API_KEY,
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
  },
  // WebAssembly 支持
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }

    // 配置 WASM 文件加载
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // 允许 WebAssembly 模块在客户端和服务器端都可用
    if (!isServer) {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    }

    return config
  },
  // Turbopack 配置
  experimental: {
    turbo: {
      rules: {
        '*.wasm': {
          type: 'webassembly/async',
          loaders: ['webassembly/async'],
        },
      },
    },
  },
}

// 添加环境变量检查
if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set');
}

if (!process.env.ARK_API_KEY) {
  console.warn('Warning: ARK_API_KEY is not set');
}

module.exports = nextConfig
