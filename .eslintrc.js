module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // 关闭未使用变量的警告
    '@typescript-eslint/no-unused-vars': 'off',
    // 或者将其设置为警告级别
    // '@typescript-eslint/no-unused-vars': 'warn'
  }
}
