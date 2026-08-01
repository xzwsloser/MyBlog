---
title: '混合精度训练'
description: 'FP16/BF16/FP8 混合精度训练原理、Loss Scaling 与 PyTorch AMP 实践'
order: 2
---

## 什么是混合精度训练

混合精度训练是指在训练过程中同时使用不同精度的浮点数，通常将模型权重和激活值使用低精度（FP16/BF16），而关键计算保留高精度（FP32），从而在不损失模型精度的前提下大幅提升训练速度。

## 精度对比

| 精度 | 指数位 | 尾数位 | 范围 | 用途 |
|------|--------|--------|------|------|
| FP32 | 8 | 23 | ~10³⁸ | 默认训练精度 |
| FP16 | 5 | 10 | ~65504 | 半精度加速 |
| BF16 | 8 | 7 | ~10³⁸ | 与 FP32 同范围，稳定性好 |
| FP8 | 5/4 | 2/3 | 有限 | 极致加速（H100+） |

## FP16 的问题：Loss Scaling

FP16 的表示范围有限，梯度值容易下溢（Underflow）变为 0。

**解决方案：Loss Scaling**

```python
# 前向传播时放大 Loss
loss = loss * scale_factor
loss.backward()

# 反向传播后缩小梯度
for param in model.parameters():
    param.grad.data /= scale_factor
```

## PyTorch AMP 实践

```python
from torch.cuda.amp import autocast, GradScaler

model = MyModel().cuda()
optimizer = torch.optim.Adam(model.parameters())
scaler = GradScaler()  # 自动处理 Loss Scaling

for data, target in dataloader:
    optimizer.zero_grad()

    # 前向传播使用混合精度
    with autocast():
        output = model(data)
        loss = criterion(output, target)

    # 反向传播
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

## BF16 的优势

BF16（Brain Floating Point）与 FP32 有相同的指数位数，因此：

- **不需要 Loss Scaling**：不会出现梯度下溢
- **与 FP32 转换简单**：直接截断尾数位即可
- **训练更稳定**：尤其适合大模型训练

```python
# PyTorch 中启用 BF16
with autocast(dtype=torch.bfloat16):
    output = model(data)
```

## 性能收益

| 模型 | FP32 时间 | FP16 时间 | 加速比 | 显存节省 |
|------|-----------|-----------|--------|----------|
| BERT-Large | 100min | 35min | 2.8x | ~40% |
| ResNet-50 | 60min | 25min | 2.4x | ~35% |
| GPT-2 | 200min | 80min | 2.5x | ~45% |
