#!/bin/bash

# 设置环境变量
export NODE_ENV=production

# 解压制品包
cd /home/admin/app
tar zxvf package.tgz

# 安装依赖
npm install

# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移（如果需要）
npx prisma migrate deploy

# 构建Next.js应用
npm run build

# 使用PM2启动应用
if pm2 list | grep -q "next-app"; then
    pm2 reload next-app
else
    pm2 start ecosystem.config.js
fi

# 输出部署完成信息
echo "Deployment completed successfully!"
