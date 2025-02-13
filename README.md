# Next.js Chat Application

[English](#english) | [中文](#chinese)

## 更新记录

### v1.3 (2025-02-13)
- 🚀 新增 WebAssembly 支持
- ⚡️ 添加 Rust 实现的高性能 Fibonacci 计算器
- 🔧 优化 WebAssembly 加载和执行流程

### v1.2 (2025-02-07)
- ✨ 新增 DeepSeek 模型支持
- 🔧 添加模型选择功能，支持在豆包模型和 DeepSeek 模型之间切换
- 📝 优化环境变量配置，添加详细注释

### v1.1 (2025-02-06)
- 🎨 优化用户界面
- 🔄 添加流式输出支持
- 🗑️ 添加聊天删除功能

### v1.0 (2025-01-22)
- 🚀 项目初始化
- 💬 基础聊天功能
- 📝 聊天历史记录
- 🔐 用户认证系统

<h2 id="english">Introduction</h2>

## Release Notes

### v1.3 (2025-02-13)
- 🚀 Added WebAssembly support
- ⚡️ Added high-performance Fibonacci calculator implemented in Rust
- 🔧 Optimized WebAssembly loading and execution process

### v1.2 (2025-02-07)
- ✨ Added DeepSeek model support
- 🔧 Added model selector feature, supporting switching between Doupack and DeepSeek models
- 📝 Optimized environment variables configuration with detailed comments

### v1.1 (2025-02-06)
- 🎨 Enhanced user interface
- 🔄 Added streaming output support
- 🗑️ Added chat deletion functionality

### v1.0 (2025-01-22)
- 🚀 Project initialization
- 💬 Basic chat functionality
- 📝 Chat history
- 🔐 User authentication system

---

A modern chat application built with Next.js 13+, featuring real-time messaging, chat history, and data persistence.

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Ant Design
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **WebAssembly**: Rust, wasm-bindgen
- **Build Tools**: wasm-pack, cargo

## Prerequisites

- Node.js 18+ and npm/pnpm
- Rust and Cargo (latest stable version)
- wasm-pack (`cargo install wasm-pack`)
- PostgreSQL database
- **ORM**: Prisma
- **Development**: Docker (PostgreSQL + pgAdmin)

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

你可以通过 pgAdmin 来管理数据库：
- URL: http://localhost:5050
- 邮箱: admin@admin.com
- 密码: admin

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

### 状态管理

使用 Zustand 进行状态管理，主要包含：
- 聊天列表管理
- 消息历史记录
- 实时消息状态

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License
