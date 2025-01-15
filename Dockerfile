FROM node:18-alpine

# 设置淘宝镜像源和 Prisma 引擎镜像
ENV REGISTRY=https://registry.npmmirror.com
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

# 设置工作目录
WORKDIR /app

# 安装 cnpm 并配置
RUN npm install -g cnpm --registry=https://registry.npmmirror.com \
    && cnpm config set registry https://registry.npmmirror.com \
    && cnpm config set disturl https://npmmirror.com/mirrors/node \
    && cnpm config set timeout 600000

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN cnpm install --timeout=600000

# 预先安装 prisma
RUN cnpm install prisma

# 复制其他文件
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN cnpm run build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]