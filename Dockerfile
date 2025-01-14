# 使用 Node.js 轻量级基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# 设置淘宝 npm 镜像和其他网络优化
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set fetch-retries 3 \
    && npm config set fetch-retry-mintimeout 15000 \
    && npm config set fetch-retry-maxtimeout 60000 \
    && npm install -g cnpm

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# 安装所有依赖
RUN cnpm install

# 生成 Prisma 客户端
RUN npx prisma generate

# 复制其余文件
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
