---
title: 'GPU 架构基础'
description: '深入理解 GPU 硬件架构、CUDA 编程模型和内存层次结构'
order: 1
---

## GPU vs CPU 架构差异

GPU 和 CPU 的设计理念完全不同：

| 特性 | CPU | GPU |
|------|-----|-----|
| 核心数量 | 少（4-64） | 多（数千） |
| 单核性能 | 极强 | 较弱 |
| 并行能力 | 弱 | 极强 |
| 适合任务 | 串行逻辑 | 数据并行 |
| 典型代表 | Intel Xeon, AMD EPYC | NVIDIA H100, A100 |

## CUDA 编程模型

### 线程层次结构

```
Grid
  ├── Block (0, 0)
  │   ├── Thread (0, 0)
  │   ├── Thread (1, 0)
  │   └── ...
  ├── Block (1, 0)
  │   └── ...
  └── ...
```

### 内存层次结构

```
寄存器（最快，每个线程私有）
  ↓
共享内存 / L1 Cache（Block 内共享）
  ↓
L2 Cache（所有 Block 共享）
  ↓
全局内存 / HBM（最慢，容量最大）
```

## 关键概念

### Warp

NVIDIA GPU 的基本调度单位是 **Warp**（32 个线程）。同一个 Warp 内的线程执行相同的指令（SIMT 模型）。

### 内存合并访问

同一个 Warp 内的线程访问连续的内存地址时，GPU 可以合并为一次内存事务，大幅提升带宽利用率。

```cuda
// 好的写法：连续访问
float val = data[threadIdx.x];

// 差的写法：跨步访问
float val = data[threadIdx.x * stride];
```

## 常用 GPU 规格

| GPU | 架构 | 显存 | FP16 TFLOPS | 互联 |
|-----|------|------|-------------|------|
| H100 | Hopper | 80GB | 989 | NVLink 4.0 |
| A100 | Ampere | 80GB | 312 | NVLink 3.0 |
| L40S | Ada | 48GB | 362 | PCIe 4.0 |
