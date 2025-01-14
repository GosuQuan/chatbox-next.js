#!/bin/bash

# 开启错误检测
set -e

echo "🚀 Starting deployment process..."

# 安装必要的软件
apt-get update
apt-get install -y docker.io docker-compose git

# 创建应用目录
mkdir -p /root/chatbox-next
cd /root/chatbox-next

# 克隆最新代码（如果目录不为空，先删除）
rm -rf /root/chatbox-next/*
git clone https://github.com/GosuQuan/chatbox-next.js.git .

# 创建环境变量文件
cat > .env << EOL
# API Keys
ARK_API_KEY=6ca6d65a-ae45-4395-8249-c099964daa52

# Database Configuration
DATABASE_URL="mysql://root:123456@mysql:3306/chatbox_db"

# Environment
NODE_ENV=production
EOL

# 停止旧容器
docker-compose down

# 清理旧的构建缓存
docker builder prune -f

# 构建新镜像并启动容器
docker-compose up -d --build

# 等待 MySQL 启动
echo "Waiting for MySQL to start..."
sleep 30

# 运行数据库迁移
docker-compose exec -T app npx prisma migrate deploy

echo "✨ Deployment completed successfully!"
echo "🌐 Your application is now running at http://47.98.105.87"
