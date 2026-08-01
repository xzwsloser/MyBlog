---
title: 'GitHub Actions 部署测试'
publishDate: 2026-08-01
description: '用于测试 GitHub Actions 自动部署流程是否正常工作的测试文章。'
tags:
  - Test
  - Deployment
language: 'Chinese'
---

## 测试目的

验证 push 到 GitHub 后，GitHub Actions 能否自动：

1. 拉取代码
2. 安装依赖（bun install）
3. 构建项目（bun run build）
4. 通过 rsync 部署到服务器
5. 重载 nginx

## 验证方式

部署成功后，访问 [xiaozhiwei.tech](https://xiaozhiwei.tech) 确认本文可见即可。
