/** @type {import('next').NextConfig} */
const nextConfig = {
  // 在生产构建时忽略 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true
  },
  // 在生产构建时忽略 TypeScript 错误
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
