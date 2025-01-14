#!/bin/bash

# 停止所有容器
docker stop $(docker ps -aq) || true
docker rm $(docker ps -aq) || true
docker system prune -af --volumes

# 准备部署目录
cd /root
rm -rf chatbox-next
mkdir -p chatbox-next
cd chatbox-next

# 克隆代码
git clone -b dev-migrateTo-Mysql https://github.com/GosuQuan/chatbox-next.js.git .

# 创建环境变量文件
cat > .env << EOL
# API Keys
ARK_API_KEY=6ca6d65a-ae45-4395-8249-c099964daa52

# Database Configuration
DATABASE_URL="mysql://root:123456@mysql:3306/chatbox_db"

# Environment
NODE_ENV=production
EOL

# 启动服务
docker-compose up -d --build

# 等待 MySQL 启动
echo "Waiting for MySQL to start..."
sleep 30

# 运行数据库迁移
docker-compose exec -T app npx prisma migrate deploy

echo "✨ Deployment completed successfully!"
echo "🌐 Your application is now running at http://47.102.125.207"
