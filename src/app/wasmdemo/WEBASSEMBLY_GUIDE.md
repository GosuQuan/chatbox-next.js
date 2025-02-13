# WebAssembly 开发指南

本指南面向希望学习和使用 WebAssembly 的前端开发工程师，将帮助你理解如何在 Next.js 项目中集成和使用 WebAssembly。

## 目录

1. [WebAssembly 基础概念](#1-webassembly-基础概念)
2. [开发环境搭建](#2-开发环境搭建)
3. [项目结构设计](#3-项目结构设计)
4. [Rust 模块开发](#4-rust-模块开发)
5. [Next.js 集成](#5-nextjs-集成)
6. [性能优化](#6-性能优化)
7. [调试和测试](#7-调试和测试)
8. [最佳实践](#8-最佳实践)

## 1. WebAssembly 基础概念

### 1.1 什么是 WebAssembly？
WebAssembly (Wasm) 是一种低级的、二进制的指令格式，设计用于在浏览器中高效执行。它可以将 C++、Rust 等语言编译成在浏览器中运行的代码。

### 1.2 为什么使用 WebAssembly？
- 近乎原生的执行速度
- 可以重用现有的 C++/Rust 代码库
- 适合计算密集型任务
- 可以处理对性能敏感的应用场景

### 1.3 WebAssembly vs JavaScript
- JavaScript：灵活、动态类型、适合 DOM 操作和业务逻辑
- WebAssembly：高性能、静态类型、适合计算密集型任务

## 2. 开发环境搭建

### 2.1 安装 Rust
```bash
# 安装 rustup（Rust 版本管理器）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 配置环境变量
source "$HOME/.cargo/env"

# 验证安装
rustc --version
cargo --version
```

### 2.2 安装 WebAssembly 工具链
```bash
# 安装 wasm32 目标
rustup target add wasm32-unknown-unknown

# 安装 wasm-pack
cargo install wasm-pack
```

### 2.3 IDE 配置
推荐使用 VS Code，安装以下插件：
- rust-analyzer：Rust 语言支持
- WebAssembly：WebAssembly 文本格式支持
- TOML：Cargo.toml 文件支持

## 3. 项目结构设计

### 3.1 推荐的目录结构
\`\`\`
my-next-app/
├── src/
│   ├── app/
│   │   └── wasmdemo/              # WebAssembly 演示页面
│   │       ├── page.tsx           # React 组件
│   │       ├── page.module.css    # 样式文件
│   │       └── README.md          # 组件文档
│   └── wasm/                      # 编译后的 WASM 文件
├── wasm/                          # Rust 源代码
│   ├── src/
│   │   └── lib.rs                 # Rust 实现
│   ├── Cargo.toml                 # Rust 项目配置
│   └── tests/                     # 测试文件
└── next.config.js                 # Next.js 配置
\`\`\`

### 3.2 模块职责划分
- Rust 模块：性能关键的计算逻辑
- TypeScript 模块：UI 交互和业务逻辑
- CSS 模块：样式和动画

## 4. Rust 模块开发

### 4.1 创建 Rust 库
```bash
cargo new --lib wasm
cd wasm
```

### 4.2 配置 Cargo.toml
\`\`\`toml
[package]
name = "wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
\`\`\`

### 4.3 编写 Rust 代码
\`\`\`rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    let mut a = 0;
    let mut b = 1;
    for _ in 1..n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fibonacci() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(5), 5);
    }
}
\`\`\`

### 4.4 编译 WebAssembly
```bash
wasm-pack build --target web
```

## 5. Next.js 集成

### 5.1 配置 Next.js
\`\`\`javascript
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    if (!isServer) {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    }

    return config
  }
}
\`\`\`

### 5.2 React 组件集成
\`\`\`typescript
// page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function WasmDemo() {
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasm = await import('@/wasm/wasm')
        await wasm.default()
        setWasmModule(wasm)
      } catch (err) {
        console.error('Failed to load WASM module:', err)
      }
    }

    loadWasm()
  }, [])

  // 使用 WASM 函数
  const calculateFibonacci = (n: number) => {
    if (wasmModule) {
      setResult(wasmModule.fibonacci(n))
    }
  }
}
\`\`\`

## 6. 性能优化

### 6.1 编译优化
- 使用 \`wasm-opt\` 优化 WASM 二进制大小
- 选择合适的编译目标（web/bundler）
- 启用 Link Time Optimization (LTO)

### 6.2 运行时优化
- 延迟加载 WASM 模块
- 使用 Web Workers 处理计算密集型任务
- 批量处理数据以减少 JS-WASM 边界调用

## 7. 调试和测试

### 7.1 Rust 代码调试
- 使用 \`println!\` 宏输出调试信息
- 编写单元测试
- 使用 \`wasm-pack test\` 运行测试

### 7.2 浏览器调试
- 使用 Chrome DevTools 的 WebAssembly 调试器
- 监控 Performance 面板中的执行时间
- 使用 Console API 记录关键信息

## 8. 最佳实践

### 8.1 代码组织
- 将计算密集型任务放在 Rust 中实现
- 保持 Rust 函数简单且职责单一
- 使用类型系统确保安全性

### 8.2 性能考虑
- 最小化 JS-WASM 边界调用
- 使用适当的数据类型
- 考虑内存管理和垃圾回收

### 8.3 开发流程
1. 识别需要优化的性能瓶颈
2. 在 Rust 中实现核心算法
3. 编写测试确保正确性
4. 编译为 WebAssembly
5. 在 React 组件中集成
6. 性能测试和优化

## 9. 常见问题解决

### 9.1 编译问题
- 检查 Rust 工具链版本
- 确保 wasm-pack 正确安装
- 验证 Cargo.toml 配置

### 9.2 集成问题
- 检查导入路径
- 确认 Next.js 配置正确
- 查看浏览器控制台错误

### 9.3 性能问题
- 使用性能分析工具定位瓶颈
- 检查数据传输开销
- 优化算法实现

## 10. 进阶主题

### 10.1 高级功能
- 共享内存和并发
- SIMD 指令优化
- 动态链接

### 10.2 工具链
- 自定义构建脚本
- 持续集成配置
- 自动化测试

### 10.3 生产部署
- 资源优化
- 错误处理
- 监控和日志

## 结论

WebAssembly 为前端开发带来了新的可能性，通过合理使用可以显著提升应用性能。本指南涵盖了从环境搭建到生产部署的完整流程，帮助你逐步掌握 WebAssembly 开发。

## 参考资源

- [Rust 官方文档](https://www.rust-lang.org/learn)
- [WebAssembly 官方文档](https://webassembly.org/)
- [wasm-bindgen 指南](https://rustwasm.github.io/docs/wasm-bindgen/)
- [Next.js 文档](https://nextjs.org/docs)
