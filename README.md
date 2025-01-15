# Next.js Chat Application

[English](#english) | [中文](#chinese)

<h2 id="english">Introduction</h2>

A modern chat application built with Next.js 13+, featuring real-time messaging, chat history, and data persistence.

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Ant Design
- **Backend**: Next.js API Routes
- **Database**: MYSQL
- **ORM**: Prisma
- **Development**: Docker (MYSQL + pgAdmin)
- **Deployment**: Docker Compose, Nginx

## Features

- 💬 Real-time messaging
- 📝 Chat history
- 🗑️ Chat management (create, delete)
- 💾 Data persistence
- 🎨 Modern UI interface
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 16+
- Docker Desktop
- cnpm (recommended) or npm

### Installation Steps

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd my-first-next-app
   cnpm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add the following content to `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatdb?schema=public"
   ```

3. Start the database:
   ```bash
   docker-compose up -d
   ```

4. Initialize database:
   ```bash
   pnpm prisma migrate dev
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

Now you can access the application at http://localhost:3000/chat.

### Database Management

You can manage the database through pgAdmin:
- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

## Deployment Guide

### Environment Setup

1. Create production environment file:
   ```bash
   cp .env.example .env.production
   ```
   Edit `.env.production` with your production settings:
   ```env
   DATABASE_URL=mysql://root:your_password@mysql:3306/chatbox_db
   ARK_API_KEY=your_api_key
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

2. Configure Nginx (if needed):
   - Edit `nginx.conf` with your domain and SSL settings
   - Place SSL certificates in the appropriate directory

### Aliyun DevOps Deployment

1. 在阿里云容器镜像服务中创建镜像仓库
   - 登录阿里云控制台
   - 进入容器镜像服务
   - 创建命名空间和镜像仓库

2. 在云效平台配置以下环境变量：
   ```
   ECS_INSTANCE_ID=your-ecs-instance-id
   MYSQL_ROOT_PASSWORD=your-mysql-password
   ENV_CONTENT=base64-encoded-env-content
   ```

3. 配置云效流水线：
   - 在云效平台创建项目
   - 选择代码源（GitHub/GitLab等）
   - 导入 `.workflow/pipeline.yml` 配置
   - 配置构建计划

4. 配置服务器：
   - 安装 Docker 和 Docker Compose
   - 配置容器镜像服务登录认证
   ```bash
   docker login registry.cn-hangzhou.aliyuncs.com
   ```
   - 创建必要的目录和文件
   ```bash
   mkdir -p /etc/letsencrypt
   ```

5. SSL 证书配置（可选）：
   - 申请 SSL 证书
   - 将证书文件放置在 `/etc/letsencrypt` 目录
   - 更新 `nginx.conf` 配置 SSL

### Docker Deployment

1. Build and start containers:
   ```bash
   # Build images
   docker compose build

   # Start services
   docker compose up -d
   ```

2. Initialize database:
   ```bash
   # Run database migrations
   docker compose exec app npx prisma migrate deploy
   ```

3. Monitor logs:
   ```bash
   # View all logs
   docker compose logs -f

   # View specific service logs
   docker compose logs -f app
   docker compose logs -f mysql
   docker compose logs -f nginx
   ```

### Maintenance

1. Update application:
   ```bash
   # Pull latest code
   git pull

   # Rebuild and restart containers
   docker compose down
   docker compose build
   docker compose up -d
   ```

2. Backup database:
   ```bash
   # Create backup
   docker compose exec mysql mysqldump -u root -p chatbox_db > backup.sql

   # Restore backup
   docker compose exec -T mysql mysql -u root -p chatbox_db < backup.sql
   ```

## Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API Routes
│   │   ├── chats/        # Chat-related APIs
│   │   └── messages/     # Message-related APIs
│   └── chat/             # Chat page
├── store/                 # State management
│   └── chatStore.ts      # Chat state management
├── types/                 # TypeScript type definitions
└── lib/                   # Utilities and configurations
    └── prisma.ts         # Prisma client

prisma/
├── schema.prisma         # Database model definitions
└── migrations/          # Database migration files
```

## Database Models

The project uses the following main data models:

- **User**: User information
- **Chat**: Chat sessions
- **Message**: Chat messages
- **KnowledgeBase**: Knowledge base (reserved)

## Development Guide

### API Endpoints

- `POST /api/chats`: Create new chat
- `GET /api/chats`: Get all chats
- `DELETE /api/chats/[id]`: Delete specific chat
- `POST /api/messages`: Send new message
- `GET /api/messages?chatId=[id]`: Get messages for specific chat

### State Management

Using Zustand for state management, including:
- Chat list management
- Message history
- Real-time message status

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License

<h2 id="chinese">介绍</h2>

一个基于 Next.js 13+ 构建的现代化聊天应用，具有实时消息传递、聊天历史记录和数据持久化功能。

## 技术栈

- **Frontend**: Next.js 13+, React, TypeScript, Ant Design
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Development**: Docker (PostgreSQL + pgAdmin)
- **Deployment**: Docker Compose, Nginx

## 功能特点

- 💬 实时消息传递
- 📝 聊天历史记录
- 🗑️ 聊天管理（创建、删除）
- 💾 数据持久化
- 🎨 现代化 UI 界面
- 📱 响应式设计

## 开始使用

### 前置要求

- Node.js 16+
- Docker Desktop
- pnpm (推荐) 或 npm

### 安装步骤

1. 克隆项目并安装依赖：
   ```bash
   git clone <repository-url>
   cd my-first-next-app
   pnpm install
   ```

2. 配置环境变量：
   ```bash
   cp .env.example .env
   ```
   将以下内容添加到 `.env` 文件：
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatdb?schema=public"
   ```

3. 启动数据库：
   ```bash
   docker-compose up -d
   ```

4. 初始化数据库：
   ```bash
   pnpm prisma migrate dev
   ```

5. 启动开发服务器：
   ```bash
   pnpm dev
   ```

现在你可以访问 http://localhost:3000/chat 来使用应用。

### 数据库管理

## 项目结构

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API 路由
│   │   ├── chats/        # 聊天相关 API
│   │   └── messages/     # 消息相关 API
│   └── chat/             # 聊天页面
├── store/                 # 状态管理
│   └── chatStore.ts      # 聊天状态管理
├── types/                 # TypeScript 类型定义
└── lib/                   # 工具函数和配置
    └── prisma.ts         # Prisma 客户端

prisma/
├── schema.prisma         # 数据库模型定义
└── migrations/          # 数据库迁移文件
```

## 数据库模型

项目使用以下主要数据模型：

- **User**: 用户信息
- **Chat**: 聊天会话
- **Message**: 聊天消息
- **KnowledgeBase**: 知识库（预留）

## 开发指南

### API 端点

- `POST /api/chats`: 创建新聊天
- `GET /api/chats`: 获取所有聊天
- `DELETE /api/chats/[id]`: 删除指定聊天
- `POST /api/messages`: 发送新消息
- `GET /api/messages?chatId=[id]`: 获取指定聊天的消息

### 状态管理

使用 Zustand 进行状态管理，主要包含：
- 聊天列表管理
- 消息历史记录
- 实时消息状态

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License
