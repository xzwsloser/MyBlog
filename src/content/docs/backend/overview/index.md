---
title: '后端开发概述'
description: '后端开发的核心技术栈、架构模式与学习路线'
order: 1
---

## 什么是后端开发

后端开发负责服务器端的业务逻辑、数据处理和 API 服务，是连接前端用户界面与数据存储的桥梁。

## 核心技术栈

### 编程语言

| 语言 | 优势 | 典型框架 |
|------|------|----------|
| Go | 高性能、并发原生支持 | Gin、Kitex、Hertz |
| Java | 生态成熟、企业级 | Spring Boot、Dubbo |
| Python | 快速开发、AI 生态 | FastAPI、Django |
| Rust | 极致性能、内存安全 | Actix、Axum |

### 中间件

- **消息队列**：Kafka、RocketMQ、RabbitMQ
- **缓存**：Redis、Memcached
- **数据库**：MySQL、PostgreSQL、MongoDB
- **服务发现**：Consul、Etcd、Nacos

## 架构模式

### 微服务架构

```
┌──────────┐   ┌──────────┐   ┌──────────┐
│  API     │   │  User    │   │  Order   │
│ Gateway  │──▶│ Service  │   │ Service  │
└──────────┘   └──────────┘   └──────────┘
                     │               │
              ┌──────┴──────┐ ┌──────┴──────┐
              │ User DB     │ │ Order DB    │
              └─────────────┘ └─────────────┘
```

## 学习路线

1. **语言基础**：掌握 Go/Java 语言特性和标准库
2. **Web 框架**：熟练使用至少一个主流框架
3. **数据库**：MySQL 索引优化、Redis 数据结构
4. **分布式系统**：微服务、RPC、消息队列
5. **工程实践**：CI/CD、容器化、监控告警
