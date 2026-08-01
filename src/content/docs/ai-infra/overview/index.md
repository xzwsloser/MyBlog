---
title: 'AI Infra 概述'
description: 'AI 基础设施（AI Infrastructure）的核心概念、技术栈与学习路线'
order: 1
---

## 什么是 AI Infra

AI Infra（AI Infrastructure）是指支撑人工智能模型训练、推理和部署的底层基础设施，涵盖硬件、软件和系统层面。它是连接 AI 算法与工程实践的关键桥梁。

## 核心领域

### 1. 计算层

- **GPU 架构**：NVIDIA CUDA、AMD ROCm 等并行计算平台
- **分布式训练**：数据并行、模型并行、流水线并行
- **混合精度训练**：FP16/BF16/FP8 低精度加速

### 2. 存储层

- 高性能分布式文件系统（Lustre、GPFS）
- 对象存储与数据湖
- 数据预处理流水线

### 3. 网络层

- InfiniBand、RoCE 高速网络
- NCCL/RCCL 集合通信库
- All-Reduce、All-Gather 等通信原语

### 4. 推理层

- 模型量化（INT8/INT4）
- 推理引擎（TensorRT、vLLM、ONNX Runtime）
- KV Cache 优化

## 学习路线

1. **基础**：理解 GPU 架构和 CUDA 编程模型
2. **进阶**：掌握分布式训练原理与实践
3. **深入**：模型推理优化与服务部署
4. **前沿**：大模型训练基础设施（千卡/万卡集群）
