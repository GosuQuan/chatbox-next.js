#!/bin/bash

# 开启错误检测
set -e

echo "🚀 Starting deployment process..."

# 安装 Docker 和 Docker Compose（如果尚未安装）
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    echo "Please log out and log back in to use Docker without sudo"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 停止并删除旧容器
echo "Stopping old containers..."
docker-compose down

# 删除旧的构建缓存
echo "Cleaning up..."
docker builder prune -f

# 构建新镜像并启动容器
echo "Building and starting containers..."
docker-compose up -d --build

# 等待 MySQL 启动
echo "Waiting for MySQL to start..."
sleep 30

# 运行数据库迁移
echo "Running database migrations..."
docker-compose exec app npx prisma migrate deploy

echo "✨ Deployment completed successfully!"
echo "🌐 Your application is now running at http://localhost:3000"
echo "📊 MySQL is available at localhost:3306"
