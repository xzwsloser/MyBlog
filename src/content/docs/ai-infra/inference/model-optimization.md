---
title: '模型推理优化'
description: '模型量化、KV Cache、推理引擎对比与部署实践'
order: 1
---

## 推理 vs 训练

| 维度 | 训练 | 推理 |
|------|------|------|
| 目标 | 最小化 Loss | 最小化延迟 |
| 精度 | 需要高精度 | 可容忍低精度 |
| 批次 | 大批次 | 小批次或单条 |
| 显存 | 大（梯度+优化器） | 较小（仅权重） |
| 瓶颈 | 计算 | 内存带宽 |

## 模型量化

### 量化类型

| 类型 | 精度 | 压缩比 | 精度损失 |
|------|------|--------|----------|
| FP16 | 16-bit | 2x | 极小 |
| INT8 | 8-bit | 4x | 很小 |
| INT4 | 4-bit | 8x | 较小 |
| GPTQ/AWQ | 4-bit | 8x | 很小（带校准） |

### 量化方法对比

- **PTQ（Post-Training Quantization）**：训练后量化，无需重新训练
- **QAT（Quantization-Aware Training）**：训练时模拟量化，精度更高
- **GPTQ**：基于 OBQ 的一次性权重量化
- **AWQ**：激活感知权重量化

## KV Cache 优化

Transformer 推理时，每个新 token 需要重新计算所有历史 token 的 Key 和 Value。KV Cache 将这些中间结果缓存起来，避免重复计算。

```python
# KV Cache 伪代码
def generate_with_kv_cache(model, prompt, max_len):
    past_key_values = None
    tokens = tokenize(prompt)

    for _ in range(max_len):
        if past_key_values is None:
            # 首次：完整前向传播
            output, past_key_values = model(tokens, use_cache=True)
        else:
            # 后续：仅处理最后一个 token
            output, past_key_values = model(
                tokens[-1:],
                past_key_values=past_key_values,
                use_cache=True
            )
        next_token = output.argmax(-1)
        tokens.append(next_token)
    return tokens
```

## 推理引擎对比

| 引擎 | 特点 | 适用场景 |
|------|------|----------|
| **vLLM** | PagedAttention、连续批处理 | 高吞吐 LLM 服务 |
| **TensorRT-LLM** | NVIDIA 官方优化 | 极致性能 |
| **llama.cpp** | CPU/GPU 通用、量化支持好 | 本地部署 |
| **ONNX Runtime** | 跨平台、多框架 | 通用模型部署 |

## vLLM 核心优化

1. **PagedAttention**：将 KV Cache 分页管理，避免显存碎片
2. **Continuous Batching**：动态合并请求，提升 GPU 利用率
3. **Prefix Caching**：共享相同前缀的请求复用 KV Cache

```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-2-7b-hf")
prompts = ["Hello, my name is", "The capital of France is"]
sampling_params = SamplingParams(temperature=0.8, top_p=0.95)
outputs = llm.generate(prompts, sampling_params)
```
