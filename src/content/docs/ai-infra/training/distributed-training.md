---
title: '分布式训练原理'
description: '数据并行、模型并行、流水线并行的原理与 PyTorch 实践'
order: 1
---

## 为什么需要分布式训练

随着模型规模的增长，单卡显存和算力已无法满足需求：

| 模型 | 参数量 | 单卡显存需求 |
|------|--------|-------------|
| GPT-3 | 175B | ~700GB (FP32) |
| LLaMA-70B | 70B | ~280GB (FP32) |
| GPT-4 | ~1.8T | ~7TB (推测) |

## 并行策略

### 1. 数据并行（Data Parallelism）

最基础的并行方式，每张卡持有完整的模型副本，处理不同的数据批次。

```
GPU 0: Model Copy + Batch[0:N]  →  Gradients 0
GPU 1: Model Copy + Batch[N:2N] →  Gradients 1  →  All-Reduce →  Update
GPU 2: Model Copy + Batch[2N:3N]→  Gradients 2
GPU 3: Model Copy + Batch[3N:4N]→  Gradients 3
```

**PyTorch DDP 示例**：

```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def setup(rank, world_size):
    dist.init_process_group("nccl", rank=rank, world_size=world_size)

model = MyModel().to(rank)
model = DDP(model, device_ids=[rank])
```

### 2. 模型并行（Tensor Parallelism）

将单个 Transformer 层的权重矩阵切分到多张 GPU 上。

```
GPU 0: W1[:, :d/2]
GPU 1: W1[:, d/2:]
     ↓
   拼接结果
```

### 3. 流水线并行（Pipeline Parallelism）

将模型按层切分，每张 GPU 负责若干层。

```
GPU 0: Layer 0-11   →   GPU 1: Layer 12-23   →   GPU 2: Layer 24-35
  ↓ Micro-batch 1        ↓ Micro-batch 1          ↓ Micro-batch 1
  ↓ Micro-batch 2        ↓ Micro-batch 2          ↓ Micro-batch 2
```

### 4. 混合并行（3D Parallelism）

结合三种策略：DP + TP + PP，用于训练超大规模模型。

## 集合通信原语

| 操作 | 含义 | 通信量 |
|------|------|--------|
| All-Reduce | 所有节点求和后广播 | 2(N-1)/N * data |
| All-Gather | 收集所有节点数据 | (N-1) * data |
| Reduce-Scatter | 规约后分散 | (N-1)/N * data |
| Broadcast | 广播到所有节点 | data |

## ZeRO 优化

DeepSpeed 提出的 ZeRO（Zero Redundancy Optimizer）分为三个阶段：

- **ZeRO-1**：切分 Optimizer State
- **ZeRO-2**：切分 Optimizer State + Gradient
- **ZeRO-3**：切分 Optimizer State + Gradient + Parameter
