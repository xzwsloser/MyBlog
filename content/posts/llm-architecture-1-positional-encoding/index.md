---
title: "大模型架构(一): 位置编码"
date: 2026-11-03T12:00:00+08:00
lastmod: 2026-11-03T12:00:00+08:00
draft: false
author: "ZhiWei Xiao"
description: "从 Self-Attention 的置换等变性出发，梳理正弦位置编码、RoPE 的推导与远程衰减，以及 YaRN、ALiBi、ReRoPE、2D-RoPE 与 NoPE 等位置编码方案。"
summary: "记录大模型位置编码的学习过程：为什么需要位置编码、正弦编码的性质与实验、RoPE 的复数推导、YaRN 外推，以及 ALiBi、ReRoPE、2D-RoPE、NoPE 等变体。"
tags: ["大模型", "Transformer", "位置编码", "RoPE", "YaRN"]
categories: ["大模型架构"]
ShowToc: true
TocOpen: true
UseHugoToc: true
ShowCodeCopyButtons: false
math: true
---

{{% callout emoji="👋" title="写在前面" type="note" %}}

本人第一篇博客，主要是记录自己学习大模型相关知识的过程，其中也借鉴了很多大佬的文章，同时部分加上了自己的理解，但是奈何本人水平有限，很多位置并没有详细的数学推导和实验设计，如果大家想要更加具体学习大模型架构相关知识，可以多看看其他大佬的博客、论文以及技术报告，例如 [科学空间](http://kexue.fm) 等。

{{% /callout %}}

## 为什么需要位置编码?

经典 Transformer 架构中，向量化之后的 token 序列会加上位置编码信息并且进行后续的 Self Attention 计算，Positional Encoding 位置如下:

{{< figure src="images/transformer-architecture.png" alt="Transformer 模型架构，位置编码加在 Input Embedding 与 Encoder、Output Embedding 与 Decoder 之间" caption="Transformer模型架构" >}}

RNN 模型中数据可以看成串行输入，计算完成 $t-1$ 时刻的隐藏状态才能计算 $t$ 时刻的状态和输出，天然具有位置信息；**但是对于 Self Attention 操作，一个完整序列并行计算元素之间的注意力分数，所以没有序列中每一个元素的位置信息。**

{{% callout emoji="🤔" title="Q & A" type="qa" %}}

**Q:** Self Attention 操作中，对于单个序列，形状为 $\mathbf x \in \mathbb R^{s \times d}$，这里对于每一个元素不是有一个绝对位置下标吗？

**A:** 虽然序列中的每一个元素 $\mathbf v_i \in \mathbb R^d$ 对应一个下标 $i$，但是在 Self Attention 计算公式中，没有出现行号 $i$，**同时如果对于输入序列仅仅进行元素交换，那么得到的输出也是仅仅元素交换，证明如下:**

假设输入为 $\mathbf X \in \mathbb R^{s \times d}$，同时 $P$ 是任意置换矩阵(交换任意元素 $i,j$ 的位置)，那么:

$$
\begin{aligned} Q &= XW_Q, & K &= XW_K, & V &= XW_V\end{aligned}
$$

同时输入交换顺序 $X' = PX$，则有 $Q' = PQ, K' = PK, V' = PV$:

$$
Q'K'^T = PQK^TP^T
$$

利用 softmax 操作可以得到:

$$
\mathrm{softmax}(PQK^TP^T) = P \ \mathrm{softmax}(QK^T)\ P^T
$$

> $P、P^T$ 操作都是交换顺序，所以这里可以移到 softmax 外面

输出:

$$
Attn(X') = P \ \mathrm{softmax}(QK^T) P^T \cdot PV = P \ \underbrace{\mathrm{softmax}\left(QK^{\top}\right)V}_{\mathrm{Attn}(X)}
$$

> $P$ 中的元素全 $1, 0$，假设 $P_{ij} = 1$ 表示将 $i$ 列交换到 $j$ 列，同时 $P^T_{ji} = P_{ij}$，几何上理解就是交换回来，所以这里 $P^T P = I$

{{% /callout %}}

同时对于 Self-Attention 操作的输入序列，可能需要包含的位置信息有如下几种:

1. **绝对位置信息**
2. **相对位置信息**
3. **不同位置之间的信息**(例如元素 $a_i, a_j$ 之间的位置差为 $|j-i|$)

## Transformer 中的位置编码

考虑到 Self Attention 模块的输入序列需要具有上面的位置信息，这就要求位置信息需要连续、有界，所以这里一个可能的想法是使用正弦函数来表示位置变换。

{{% callout emoji="🤔" title="Q & A" type="qa" %}}

**Q:** 为什么这里位置信息需要连续、有界?

**A:** 连续有界不是严格条件，例如 `GPT-2、BERT` 等模型使用可学习的位置嵌入表，不连续也不解析，同时效果比较好；**正弦位置编码让相对位置变成线性可达的量，连续和有界是实现这个目标的手段。**

设计目标:

- **打破置换等变: 让 $i$ 参与计算**
- **相对位置可学: 模型可以学习到偏移 $k$ 位**
- **数值可控(有界性)**

{{% /callout %}}

Transformer 使用正余弦交替的方式来表示位置，对应的位置向量表示为:

$$
\begin{aligned}
P_{(t, 2i)} &= \sin\left({\frac {t}{10000^{\frac {2i}{d}}}}\right) \\
P_{(t, 2i+1)} &= \cos\left(\frac {t}{10000^{\frac {2i}{d}}}\right)
\end{aligned}
$$

我们考虑**正弦位置编码**的其他几种特性:

{{% feature-list %}}

- **平移是线性**

  取单个频率 $\omega$，一对编码(二维)可以表示为

  $$
  \mathbf p_t = \begin{pmatrix} \sin(\omega t) \\ \cos(\omega t) \end{pmatrix}
  $$

  偏移 $k$ 之后可以得到位置:

  $$
  \mathbf p_{t+k} = \begin{pmatrix} \sin(\omega (t+k)) \\ \cos(\omega (t+k)) \end{pmatrix} = \begin{pmatrix} \sin(\omega t) \cos(\omega k) + \cos(\omega t)\sin(\omega k) \\ \cos(\omega t) \cos(\omega k) - \sin(\omega t) \sin(\omega k) \end{pmatrix}
  $$

  所以可以表示为:

  $$
  \mathbf p_{t+k} = \begin{pmatrix} \cos(\omega k) && \sin (\omega k) \\-\sin (\omega k) && \cos (\omega k) \end {pmatrix} \mathbf p_t = M_k \mathbf p_t
  $$

- **有界 -> 量级可控**

  对于正弦编码函数，每一个位置编码元素信息落在 $[-1,1]$，同时整段编码的范数固定为 $\sqrt {\frac {d}{2}}$ 和位置无关(一共 $\frac {d}{2}$ 对 $\sin^2 \theta + \cos^2 \theta = 1$)。

- **多频几何级数 -> 编码唯一**

  如果我们使用单一频率，例如 $\sin(\omega t)$ 周期为 $\frac {2 \pi}{\omega}$，所以 $t$ 和 $t + \frac {2 \pi}{\omega}$ 的编码完全相同，可能导致位置信息丢失，这里 Transformer 中选取了 $\frac {d}{2}$ 个不同频率，按照几何级数排列:

  $$
  \omega_i = \frac {1}{10000^{\frac {2i}{d}}}, i = 0, 1, \cdots, \frac {d}{2}-1
  $$

  $i=0$ 时候，$f = 1, \lambda = 2\pi$，相当于移动 $2 \pi$ 个 token 出现重叠；但是对于 $\frac {d}{2} -1$ 的位置，此时频率 $f \approx \frac {1}{10000}, \lambda \approx 62800$，波长够长，可以用于区分远处位置。

  > **注意到这是对于某个位置 $t$ 的 token 的位置编码，所以这里我们关注这一套位置编码机制是否可以正确表示每一个 token 的位置，低维处低频率可以确定粗位置，同时高频可以确定细位置(微调)**

- **点积仅仅依赖于偏移量**

  $$
  \mathbf p_t \cdot \mathbf p_{t+k} = \sin(\omega t) \sin(\omega (t+k)) + \cos(\omega t) \cos(\omega (t+k)) = \cos(\omega k)
  $$

  所以对于所有频率求和可以得到:

  $$
  \mathbf P_t \cdot \mathbf P_{t+k} = \sum_i \cos(\omega_i k)
  $$

  > **局部性，相距越近的两个 token 位置信息上的相似性越近似**

  同时上述信息引入了对称性，也就是:

  $$
  \mathbf P_{t-k} \cdot \mathbf P_t = \sum_i (\cos w_i k) = \mathbf P_t \cdot \mathbf P_{t+k}
  $$

  所以上述变换表示，**虽然位置向量的点积可以用于表示距离，但是无法用于表示位置的方向性**。

{{% /feature-list %}}

但是正弦位置编码没有成为主流，例如 GPT-2 使用可学习嵌入、Llama 等现代大模型使用 RoPE，可能的原因如下:

1. 是**绝对位置编码**，相对性只是可以使用线性表达，但是并非内建
2. **外推能力比较差**，现代大模型上下文很长，位置索引超出训练范围就会崩溃
3. 加在 embedding 上可能会污染 token 表示 (位置和内容混叠)

{{% callout emoji="📎" title="绝对位置编码 vs 相对位置编码" type="note" %}}

相对位置编码和绝对位置编码描述对于 Attention Score 的影响，绝对位置编码中存在:

$$
\mathbf h_i = \mathbf x_i + \mathbf p_i, A_{ij} = (\mathbf h_i W_Q) (\mathbf h_j W_k)^T
$$

相对位置编码仅仅让偏移量进入到注意力分数:

$$
A_{ij} = \mathbf q_i \mathbf k_j^T + b(i - j)
$$

{{% /callout %}}

### Experiment

Sinusoidal 编码代码实现如下:

```Python
import nn
from torch import nn

class SinusoidalPE(nn.Module):
    def __init__(self, base=1e4):
        super().__init__()
        self.base = base
    def forward(self, X):
        s, d = X.shape
        if d % 2 != 0:
            raise ValueError('hidden_size must be even')
        pos = torch.arange(0, s, 1, dtype=torch.float32).unsqueeze(1) # (slen, 1)
        i = torch.arange(0, d, 2, dtype=torch.float32) # (d/2,)
        div = torch.pow(self.base, i / d)
        angles = pos / div # (slen, d/2)
        pe = torch.empty(size=(s, d),dtype=torch.float32)
        pe[:, ::2] = torch.sin(angles) 
        pe[:, 1::2] = torch.cos(angles)
        return X + pe, pe
```

同时利用上述代码我们设置了如下几组实验，并且得到最终结果:

1. Position Encoding 大小分布情况(大小、方差、范数)，主要验证高频、低频位置分布情况:

   > **左图** — 采样的方式，所有的样本点个数为 slen x d，这里的含义是所有样本点分布的直方图，主要分为两种情况，一种是 $\lambda < s$，对应高频(蓝色曲线)，另外一种 $\lambda > s$ 对应低频(橙色曲线)，可以发现高频位置分布类似于 U 形，同时低频分别聚集在 0 和 1 的地方
   >
   > **中图** — 不同维度位置编码方差，可以发现高频位置方差几乎稳定在 $\frac {1}{\sqrt 2}$，低频位置方差震荡比较大，这是由于高频部分在整个上下文中已经走过多个位置，但是低频位置甚至没有走过一个周期
   >
   > **右图** — 每个位置的位置编码范数恒定

   {{< figure src="images/pe-distribution.png" alt="Position Encoding 的大小、方差与范数分布实验结果" caption="Position Encoding 分布情况实验结果" >}}

2. **Position Encoding 点积/相关性**:

   > **左图** — 位置编码的混淆矩阵，$PE (PE)^T$，可以发现相邻位置的相似度大，距离远的位置相似度小
   >
   > **右图** — Sinusoidal 位置编码的衰减性，随着偏移增大，相似度逐渐减小，理论上对应的点积应该固定为 $\sum_k \cos(\omega k)$，实际基本和理论曲线重合

   {{< figure src="images/pe-dot-product.png" alt="Position Encoding 点积与相关性：左侧为相似度矩阵，右侧为相似度随偏移量的衰减曲线" caption="Position Encoding 点积与相关性：左图为 $PE(PE)^{T}$ 的混淆矩阵，右图为点积随偏移量的衰减" >}}

3. **Position Encoding 对于 Attention Score 的影响**:

   > 如下两幅图主要探讨加入了位置编码之后 Attention Score 的变化，此时 Attention Score 计算公式为: $(\mathbf q_m + PE_m)(\mathbf k_n + PE_n)^T$ 展开之后其实是 $\mathbf q_m\mathbf k_n^T + cross + PE_nPE_m^T$，主要讨论这些项分别最后的注意力分数的影响
   >
   > **左图** — 选取不同的中心，在距离中心一定范围的位置内计算 Attention Score，可以发现存在一定的衰减性，同时变化范围比较大
   >
   > **右图** — 可以发现这里 $\mathbf q_m \mathbf k_n^T$ 和交叉项变化不大(这里都是使用 $\mathcal N(0, 1)$ 初始化的)，位置编码对于衰减的影响最大，同时此时位置编码可能污染了 Q、K 编码(正余弦编码中比较大的一个问题)

   {{< figure src="images/pe-attention-score.png" alt="加入位置编码后 Attention Score 在中心附近的变化，以及内容项、交叉项和位置项各自的贡献" caption="位置编码对 Attention Score 的影响：左图为中心附近的分数衰减，右图为内容项、交叉项与位置项的变化" >}}

4. Position Encoding 相似度与相对位置关系:

   > 主要探讨位置编码的对称性，这里可以发现位置编码相似度只与相对位置相关(实际上是 $\cos(\omega \delta)$)，左图和右图分别是相似度和偏移量的变化情况

   {{< figure src="images/pe-similarity.png" alt="位置编码相似度与相对位置偏移的关系曲线" caption="位置编码相似度与相对位置的关系：相似度仅依赖于偏移量" >}}

## RoPE

**RoPE (旋转位置编码) 是一种相对位置编码**，是一种配合 Attention 机制可以达到 **"绝对位置编码的方式实现相对位置编码"** 的设计，最早在博客 [2] 中提出，后续整理成论文 [3]；RoPE 目前是大部分主流大模型采用的位置编码。

RoPE 核心思想是 **"通过绝对位置编码的方式实现相对位置编码"**，下面我们推导 RoPE 的具体形式(参考 [2])。

首先，我们考虑对于 $\mathbf q, \mathbf k$ 添加绝对位置信息:

> 绝对位置编码表示位置编码信息和 token 下标相关

$$
\tilde {\mathbf q}_m = f(\mathbf q, m), \ \tilde {\mathbf k}_n = f(\mathbf k, n)
$$

Attention 核心操作为内积，所以这里我们希望内积结果带有相对位置信息，假设存在如下恒等关系:

> Attention 中核心操作为 $QK^T$，所以这里讨论 Attention Score 和位置编码之间的关系，此时对应的结果应该和 $\mathbf q, \mathbf k, m-n$ 相关

$$
\langle f(\mathbf q, m), f(\mathbf k, n) \rangle = g(\mathbf q, \mathbf k, m-n)
$$

我们的目标就是求解满足该恒等式的一个解，初始条件我们可以合理假设 $f(\mathbf q, 0) = \mathbf q, f(\mathbf k, 0) = \mathbf k$。

我们首先考虑二维情形，直接可以借助复数求解，复数中存在 $\langle \mathbf q, \mathbf k \rangle = Re[\mathbf q \mathbf k^*]$ (向量内积和复数乘积之间的映射关系)，所以我们可以得到:

$$
Re[f(\mathbf q, m) f^*(\mathbf k, n)] = g(\mathbf q, \mathbf k, m-n)
$$

我们不妨假设 $f(\mathbf q, m)f^*(\mathbf k, n) \in R$，所以这里存在 $f(\mathbf q, m) f^*(\mathbf k, n) = g(\mathbf q, \mathbf k, m-n)$，我们可以使用复数的指数形式表示:

$$
f(\mathbf q, m) = R_f(\mathbf q, m)e^{i\Theta_f(\mathbf q, m)}
$$

$$
f(\mathbf k,n) = R_k(\mathbf k, n)e^{i\Theta_k(\mathbf k, n)}
$$

$$
g(\mathbf q, \mathbf k, m-n) = R_g(\mathbf q, \mathbf k, m-n)e^{i\Theta_g(\mathbf q, \mathbf k, m-n)}
$$

带入方程组可以得到:

$$
R_f(\mathbf q, m)R_k(\mathbf k, n) = R_g(\mathbf q, \mathbf k, m-n)
$$

$$
\Theta_f(\mathbf q, m) - \Theta_f(\mathbf k, n) = \Theta_g(\mathbf q, \mathbf k, m-n)
$$

对于第一个方程，我们不妨考虑令 $m = n$，则有:

$$
R_f(\mathbf q, m) R_f(\mathbf k, m) = R_g(\mathbf q, \mathbf k, 0) = R_f(\mathbf q,0) \mathbf R_f(\mathbf k, 0) = ||q||||k||
$$

对于上述结果，我们可以假设 $R_f(\mathbf q, m) = ||\mathbf q||, R_f(\mathbf k, n) = ||\mathbf k||$，也就是对应的模长不依赖于位置信息 $m、n$。

同样，对于第二个方程，我们也可以考虑令 $m = n$，则有:

$$
\Theta_f(\mathbf q, m) - \Theta_f(\mathbf k, n) = \Theta_g(\mathbf q, \mathbf k, 0) = \Theta_f(\mathbf q, 0) - \Theta_f(\mathbf k, 0) = \Theta(\mathbf q) - \Theta(\mathbf k)
$$

通过上面的式子可以得到 $\Theta_f(\mathbf q, m) - \Theta(\mathbf q) = \Theta_f(\mathbf k, m) - \Theta(\mathbf k)$，所以这里的 $\Theta_f(\mathbf q, m) - \Theta(\mathbf q)$ 应该是一个只与位置信息相关的量，并且和 $\mathbf q$ 无关，这里不妨假设为 $\varphi(m)$，所以这里存在 $\Theta_f(\mathbf q, m) = \Theta(\mathbf q) + \varphi(m)$，这里如果带入 $n = m - 1$，那么可以得到:

$$
\varphi(m) - \varphi(m-1) = \Theta_g(\mathbf q, \mathbf k, 1) + \Theta(\mathbf k) - \Theta(\mathbf q)
$$

这里如果令等式右端为 $\theta$，那么可以得到 $\varphi(m) = m \theta$。

所以根据上述推导，我们得到了二维情况下使用复数表示的 RoPE:

$$
f(\mathbf q, m) = R_f(\mathbf q, m)e^{i\Theta_f(\mathbf q, m)} = ||q|| e^{i(\Theta(\mathbf q) + m\theta)} = \mathbf qe^{im\theta}
$$

我们考虑复数角度转换到几何角度，上述变化其实是对于向量 $\mathbf q$ 进行了逆时针旋转 $m\theta$ 角度，并且可以写成矩阵形式:

$$
f(\mathbf q, m) = \begin{pmatrix} \cos(m\theta) & -\sin(m\theta) \\ \sin(m\theta) & \cos(m\theta)\end{pmatrix}  \begin{pmatrix} q_0 \\ q_1\end{pmatrix}
$$

同时我们可以考虑扩展到任意偶数维度的 RoPE，可以表示为二维情形的拼接，也就是如下形式:

$$
\mathcal{R}_m=\begin{pmatrix}\cos m\theta_0 & -\sin m\theta_0 & 0 & 0 & \cdots & 0 & 0\\\sin m\theta_0 &  \cos m\theta_0 & 0 & 0 & \cdots & 0 & 0\\0 & 0 & \cos m\theta_1 & -\sin m\theta_1 & \cdots & 0 & 0\\0 & 0 & \sin m\theta_1 &  \cos m\theta_1 & \cdots & 0 & 0\\\vdots & \vdots & \vdots & \vdots & \ddots & \vdots & \vdots\\0 & 0 & 0 & 0 & \cdots & \cos m\theta_{d/2-1} & -\sin m\theta_{d/2-1}\\0 & 0 & 0 & 0 & \cdots & \sin m\theta_{d/2-1} &  \cos m\theta_{d/2-1}\end{pmatrix}
$$

上述为旋转矩阵，$f(\mathbf q, m) = \mathcal R_m \mathbf q$。

{{% callout emoji="🤔" title="Q & A" type="qa" %}}

**Q:** 为什么 RoPE 扩展到高维形式可以写成二维情形的拼接，对于相邻的两个维度旋转 $m\theta$ 角度?

**A:** 苏神的解释是内积的线性叠加性，下面扩展一下。

把 $\mathbb R^d$ 分成相互正交的二维平面，向量写成各投影的拼接，也就是 $\langle u, v \rangle = \sum_j \langle u_j, v_j \rangle$，上述旋转矩阵其实是让每一个平面旋转 $\theta_j$，也就是存在 $f(x, m) = (x_0e^{im\theta_0}, x_1e^{im\theta_1}, \cdots, x_{d/2-1}e^{im\theta_{d/2 - 1}})$。

所以这里总内积之和就是各个平面内的内积之和，也是仅仅依赖于 $m-n$，同时分块对角的原因是不同平面之间不存在耦合，第 $k$ 个旋转仅仅作用在第 $k$ 对坐标上，其他位置都是 $0$。

{{% /callout %}}

所以利用上述旋转矩阵，Attention 操作就自动包含相对位置信息了，存在如下恒等式:

$$
(\mathcal R_m \mathbf q)^T (\mathcal R_n \mathbf k) = \mathbf q^T \mathcal R^T_m \mathcal R_n \mathbf k = \mathbf q^T \mathcal R_{n-m} \mathbf k
$$

同时注意到 $\mathcal R_m \mathcal R_m^T = I$，所以 $\mathcal R_m$ 是正交矩阵，不会改变向量的模长，所以不会改变原模型的稳定性。

> 正交矩阵特征值落在单位圆上 ($|\lambda| = 1$)，并且实矩阵特征值成共轭出现，所以经过这个变换不会改变特征向量的大小

同时由于 $\mathcal R_m$ 的稀疏性，直接使用矩阵乘法可能会浪费算力，所以考虑使用如下方式来进行 RoPE 计算:

$$
\mathcal{R}_m\, q \;=\;\begin{pmatrix} q_0\\ q_1\\ \vdots\\ q_{d-1}\end{pmatrix}\otimes\begin{pmatrix} \cos m\theta_0\\ \cos m\theta_0\\ \vdots\\ \cos m\theta_{d/2-1}\\ \cos m\theta_{d/2-1}\end{pmatrix}+\begin{pmatrix} -q_1\\ q_0\\ \vdots\\ -q_{d-1}\\ q_{d-2}\end{pmatrix}\otimes\begin{pmatrix} \sin m\theta_0\\ \sin m\theta_0\\ \vdots\\ \sin m\theta_{d/2-1}\\ \sin m\theta_{d/2-1}\end{pmatrix}
$$

RoPE 论文中选择 $\theta_i = 10000^{-\frac {2i}{d}}$，原因是可以带来一定的远程衰减性，证明如下:

$\mathbf q, \mathbf k$ 分组之后，加上 RoPE 的内积可以使用复数乘法表示为如下形式:

$$
(\mathcal R_m \mathbf q)^T(\mathcal R_n \mathbf k) = Re[\sum_{i=0}^{\frac {d}{2}-1} \mathbf q_{[2i:2i+1]} \mathbf k^*_{[2i:2i+1]}e^{i(m-n)\theta}]
$$

同时令 $h_i = \mathbf q_{[2i:2i+1]} \mathbf k^*_{[2i:2i+1]}, S_j = \sum_{i=0}^{j-1} e^{i(m-n)\theta_i}$，并且约定 $h_{\frac {d}{2}} = 0, S_0 = 0$，同时我们可以考虑使用 Abel 变换:

> Abel 变换: $\sum_0^{n-1} a_i(b_{i+1}-b_i) = a_nb_n - a_0b_0 - \sum_{i=0}^{n-1} b_{i+1}(a_{i+1}-a_i)$
>
> 具体证明方法展开然后观察 $b_i$ 前面的系数即可

$$
\sum_{i=0}^{\frac {d}{2}} \mathbf q_{[2i:2i+1]} \mathbf k^*_{[2i:2i+1]}e^{i(m-n)\theta_i} = \sum_{i=0}^{\frac {d}{2} -1} h_i(S_{i+1} - S_i) = -\sum_{i=0}^{\frac {d}{2} -1} S_{i+1} (h_{i+1} - h_i)
$$

所以可以得到:

$$
\begin{aligned}
\left|\sum_{i=0}^{\frac {d}{2} - 1} \mathbf q_{[2i:2i+1]} \mathbf k^*_{[2i:2i+1]} e^{i(m-n)\theta_i}\right|
&= \left|\sum_{i=0}^{\frac {d}{2} - 1} S_{i+1}(h_{i+1} - h_i)\right| \\
&\leq \sum_{i=0}^{\frac {d}{2} -1} |S_{i+1}||h_{i+1} - h_i|
\leq \left(\max_i |h_{i+1} - h_i|\right)\sum_{i=0}^{\frac {d}{2} -1} |S_{i+1}|
\end{aligned}
$$

同时我们考虑 $\sum_{i=1}^{\frac {d}{2}} |S_i|$ 随着相对距离变化的情况，其中 $\theta_i = 10000^{-\frac {2i}{d}}$:

{{< figure src="images/rope-long-range-decay-bound.png" alt="这张图表对应文档中提及的RoPE相关内容，横轴为相对距离，纵轴为相对大小，整体呈黑色背景。图中蓝色曲线随着相对距离增大，整体呈现明显的衰减趋势，在相对距离数值从0增加到250的过程中，曲线数值从接近20下降到接近7，且在衰减过程中还存在上下波动的情况，直观体现了相对距离变大时内积出现衰减的趋势，该衰减与RoPE机制的作用效果相关，和文档中“随着相对距离变大，内积出现了衰减的趋势”的描述相符。" caption="RoPE 远程衰减的上界 $\sum_i |S_i|$ 随相对距离的变化" >}}

可以发现，随着相对距离变大，内积出现了衰减的趋势；也就是说距离越大，Attention Score 的分数会出现衰减；另外选择 $\theta_i$ 并不一定固定，几乎任意光滑单调函数都可以，但是这里还是沿用了已经有的选择。

另外 **RoPE 可以用于 Linear Attention**，这里后面讨论注意力机制的时候会重点说明。

### RoPE外推

首先我们讨论 RoPE 位置编码可能存在的问题，注意到 RoPE 中使用的旋转角度: $\theta_i = b^{-\frac{2i}{d}}$，所以对于指定的维度 $i$，那么这个维度会对应波长可以表示为 $\lambda_i = \frac {2 \pi}{\theta_i} = 2\pi b^{\frac {2i}{d}}$，表示距离 $\lambda_i$ 的两个 token 在平面 $i$ 上(高维分为多个二维平面)，旋转角度完全相同，**此时绝对位置需要通过更高维度(更长波长、更低频率)的平面的旋转角度确定。**

> 研究显示: 神经网络中高频比低频率更难学习，高频是比较细小的扰动，低频是平滑趋势

- **短波长、高频率**的维度确定相对位置，$L_{train} > \lambda_i$，此时在训练过程中会产生绕圈(例如对于指定维度 $i$，绕圈数量为 $\frac {L_{train}}{\lambda_i}$)，**此时模型可以学习到相对位置信息(类似于闹钟秒钟，定位更加精确，但是对于近距离更有效)**
- **长波长、低频率**的维度确定绝对位置，此时 $L_{train} < \lambda_i$，此时训练过程中不会产生绕圈，**此时模型相当于学习到绝对位置(类似于闹钟时钟，定位更加粗糙，但是定位范围更广)**

所以在推理过程中，对于相对距离为 $L$ 的两个 token，并且针对于指定维度 $i$，对应的波长为 $\lambda_i$，存在如下情况(对于 $\lambda$ 比较大的情况):

1. $L < L_{train}$ 正常
2. $L_{train} \lt L \lt \lambda_i$ 相位没有出现绕圈，但是模型可能没见过对应的旋转角度
3. $L \gt L_{train}$ 开始绕圈，此时模型可能认为见过某个角度但是对应多个位置，此时几乎丢失了低频对应的绝对位置信息

现代大模型追求长上下文，例如现在主流模型都支持 $1M$ 上下文，同时几乎都是通过外推的方式来进行上下文扩展的，YaRN 就是一种常见的上下文外推方法。

#### YaRN

YaRN 在论文 [4] 中提出，主要提出了 NTK-by-parts 以及 Dynamic NTK 的方法来解决大模型上下文长外推的问题。

首先，RoPE 中长上下文情况下绝对位置分量丢失的具体原因还是某些维度对应的波长的长度问题，同时我们可以注意到这里波长主要还是和相对位置以及维度对应的 $\theta_i$ 相关，例如 RoPE 中 $q、k$ 对应的旋转操作可以写成如下形式:

$$
f_{\mathbf W}(\mathbf x_m, m, \mathbf \theta) = e^{i m \theta} \mathbf W \mathbf x_m
$$

大部分长上下文外推的方法都是考虑对于位置和角度做变换，也就是求解合适的 $f'_{\mathbf W}$:

$$
f'_{\mathbf W}(\mathbf x_m, m, \mathbf {\theta}) = f_{\mathbf W}(\mathbf x_m, g(m), h(\mathbf {\theta}))
$$

同时在长上下文外推中，我们不妨假设上下文长度为 $L$，我们的目标是扩展上下文长度到 $L'$ $(L' > L)$ (是否使用微调可选)，另外我们可以定义缩放因子 $s = \frac {L'}{L}$，同时对应指定维度 $d$，对应的波长可以表示为 $\lambda_d = \frac {2 \pi}{\theta_d} = 2\pi b^{\frac {2d}{|D|}}$。

另外一种长上下文扩展的方案是 PI，使用的方法为 NTK-aware，也就是把所有维度的波长进行缩放，其中取 $g(m) = s \cdot m, h(\theta) = \theta$，但是这种情况下已经学好的高频分量也产生了重新映射和移动，所以可能效果不是很好。

YaRN 核心思想就是: 对于已经学好、难学的高频分量，尽可能不动，对于关系绝对位置的低频分量采取重新映射的方式，调整相位分布。

YaRN 中定义比如 $r(d) = \frac {L}{\lambda_d} = \frac {L}{2 \pi b^{\frac {2d}{|D|}}}$ 表示预训练过程中绕圈的次数(高频绕圈多、低频率绕圈少)，同时利用这个变量就可以对于高低频进行区分，并且分别采用不同的调整策略，定义分段函数 $\gamma(r)$:

$$
\gamma(r) =
\begin{cases}
0, & \text{if } r \lt \alpha \\
1, & \text{if } r \gt \beta \\
\dfrac{r - \alpha}{\beta - \alpha}, & \text{else}
\end{cases}
$$

同时，NTK-by-parts 方法定义如下 $g(m)、h(\theta)$:

$$
\begin{aligned}
g(m) &= m \\
h(\theta_d) &= (1 - \gamma(r(d)))\frac {\theta_d}{s} + \gamma(r(d)) \theta_d
\end{aligned}
$$

> $\alpha、\beta$ 都是超参数，论文中取 $\alpha=1, \beta=32$

上述映射函数在 $r$ 比较大的时候(高频)时 $\gamma(r) = 1, h(\theta_d) = \theta_d$，**高频分量难以训练，所以尽可能保持不动**，在 $r$ 比较小的时候(低频)时 $\gamma(r) = 0, h(\theta_d) = \frac {\theta_d}{s}$，将长上下文 $L'$ 下的波长覆盖范围压缩到了 $L$，后续可以通过微调(或者不使用微调)的方式来进行上下文扩展(**低频容易训练，所以使用微调的方式可行**)。

另外 YaRN 论文中还提出了给 Softmax 加上温度系数 $t$ 的方法，可以调整 Softmax 输出概率的置信度，这一部分和今天的主题关联度不大，故不做具体讨论。

YaRN 中还提出了一种 Dynamic NTK 的方法，主要解决使用不同上下文长度的序列作为输入(例如自回归任务等)，具体流程是在每一次前向传播的过程中，不断更新缩放因子 $s = \max(1, \frac {l'}{L})$。

### Experiment

RoPE 实现代码如下:

```Python
import torch
from torch import nn

class RoPE(nn.Module):
    def __init__(self, base=1e4):
        super().__init__()
        self.base = base
    def forward(self, X):
        s, d = X.shape
        if d % 2 != 0:
            raise ValueError('hidden size must be even')
        i = torch.arange(0, d, 2, dtype=torch.float32) # (d/2, )
        theta = 1 / torch.pow(self.base, i / d) # (d/2, ) -> theta
        pos = torch.arange(0, s, dtype=torch.float32).unsqueeze(1) # (s, 1)
        angles = pos * theta # (s, d/2)

        res = torch.zeros(size=(s, d), dtype=torch.float32)
        res[:, ::2] = X[:, ::2] * torch.cos(angles) - X[:, 1::2] * torch.sin(angles)
        res[:, 1::2] = X[:, 1::2] * torch.cos(angles) + X[:, ::2] * torch.sin(angles)
        return res
```

同时依据上述 RoPE 原理以及代码实现设计了如下实验:

1. **RoPE 中位置编码相似度**:

   > RoPE 位置编码相似度随着距离呈衰减趋势，右图呈现出波动的形态，主要原因是这里相似度其实是多个不同的维度的位置编码的叠加 $\sum_k \omega \cos(\delta \theta_k)$ 部分频率的曲线呈周期性起伏，同时曲线之间可能产生干涉，但是总体形式还是呈现衰减的(虽然难以满足绝对的衰减，但是训练过程中内容占主导，RoPE 存在衰减趋势即可)

   {{< figure src="images/rope-similarity.png" alt="RoPE 位置编码相似度随相对距离的衰减曲线" caption="RoPE 位置编码相似度随距离的衰减" >}}

2. **RoPE 对于 Attention Score 的影响:**

   > 这里我们可以看第二幅图，使用 RoPE 位置编码，此时的 Attention Score 其实只与 $\mathbf q、\mathbf k、m-n$ 相关，我们可以观察到一条直线上的 Attention Score 保持一致，同时第三幅图中我们可以发现这里衰减还是内容项主导的(内容决定衰减的方向和趋势、RoPE 也不会影响内容项本身)

   {{< figure src="images/rope-attention-score.png" alt="RoPE 位置编码下 Attention Score 的分布与衰减情况" caption="RoPE 对 Attention Score 的影响" >}}

3. **RoPE 远程衰减来源:**

   > 这里我们讨论 RoPE 远程衰减来源，第一二幅图中我们可以发现(之前说过 Attention Score 中包含多种波长的波的叠加)高频波随着距离增加最后几乎全部抵消，同时低频波衰减，这里的低频波其实就是衰减的主要原因，最后一幅图中对比了存在内容和随机取 $q、k$ 的区别，我们可以发现，对于对齐内容，这里 RoPE 效果更好，对比 NoPE 存在一定的衰减(对比蓝色和橙色曲线)

   {{< figure src="images/rope-decay-source.png" alt="RoPE 远程衰减来源：高频波相互抵消、低频波逐渐衰减，以及与 NoPE 的对比" caption="RoPE 远程衰减的来源" >}}

4. $\sum |S_i|$ 衰减曲线

   > 苏神博客中证明了 Attention Score 随着距离变化的上界 $A \sum_i |S_i|, A \in R$，其中 $S_j = \sum_{i=0}^{j-1} e^{(m-n)\theta_i}$(可以理解为固定距离，各个维度波叠加的结果)，具体原因可以参考实验 3(高频相互抵消、低频逐渐衰减)

   {{< figure src="images/rope-sum-si.png" alt="RoPE 中 sum |S_i| 随相对距离变化的衰减曲线" caption="$\sum_i |S_i|$ 的衰减曲线" >}}

## 其他位置编码

### ALiBi

ALiBi 算法中直接在注意力分数上加上线性惩罚:

$$
score_{ij} = q_ik_j^T - m_h(i - j), m_h \gt 0
$$

形式比较简单，同时各个维度地位几乎相同，相当于手动加上了邻近偏好，优点是零参数、外推性好(所有维度地位相同，不会存在 RoPE 在长上下文下的问题)，缺点是线性偏置、表达能力可能受限等。

### ReRoPE

RoPE 外推存在的问题是超过训练长度的相对距离可能产生没有见过的相位，ReRoPE 的核心思想是: **超出指定长度范围的 token 对，求解 Score 的时候使用最长长度**

$$
score(m, n) =
\begin{cases}
\langle \mathcal {R_{m-n}}q_m, k_n \rangle, & |m-n| \leq w \\
\langle \mathcal R_wq_m, k_n \rangle, & |m-n| \gt w
\end{cases}
$$

注意 ReRoPE 是距离维度的，YaRN 是频率维度的；ReRoPE 的思想是"限制"上下文长度、YaRN 的思想是限制频率($\theta$)，二者正交，甚至可以叠加使用。

### 2D-RoPE

2D-RoPE 和 RoPE 的区别在于，2D-RoPE 输入的序列位置是二维的，也就是对于输入的向量 $\mathbf q、\mathbf k$，其中每一个元素需要使用两个坐标确定，也就是 $\mathbf q_{m_1, m_2}、\mathbf k_{n_1, n_2}$(注意到这里 $\mathbf q_{m_1, m_2}、\mathbf k_{n_1, n_2} \in R^d$)，对于 $d = 4$ 的情况，对应的旋转矩阵为:

$$
\mathbf{R}_{m_1,m_2}=\left[\begin{array}{cc|cc}\cos m_1\theta & -\sin m_1\theta & 0 & 0\\\sin m_1\theta &  \cos m_1\theta & 0 & 0\\ \hline0 & 0 & \cos m_2\theta & -\sin m_2\theta\\0 & 0 & \sin m_2\theta &  \cos m_2\theta\end{array}\right]
$$

可以这样理解，对于 $\mathbf q_{r, c} \in R^d$，按照维度分为两个部分，并且维度大小都是 $\frac {d}{2}$，例如如果 $d = 4$，那么此时分为 2 个 2 对，每一个对按照行/列旋转，例如前 $\frac {d}{2}$ 就按照行，旋转 $r\theta$ 角度，后面 $\frac {d}{2}$ 就按照列，旋转 $c\theta$ 角度，旋转矩阵大小依然为 $d$，所以此时对于 $\mathbf q_{m_1, m_2}、\mathbf k_{n_1, n_2}$，此时存在：

$$
\begin{aligned}
&\mathbf q_{m_1, m_2} \mathbf k_{n_1, n_2}^T \\
&\quad = q^f_{m_1,m_2}R^f_{m1}(R^f)^T_{n_1}(k^f)^T_{n_1, n_2} \\
&\qquad + q^b_{m_1, m_2}R^b_{m2}(R^b)^T_{n_2}(k^b)_{n_1, n_2} \\
&\quad = q_{m_1, m_2}^f R^f_{m_1 - m_2}(k^f)_{n_1, n_2} \\
&\qquad + q_{m_1, m_2}^b R^b_{n_1 - n_2}(k^b)_{n_1, n_2} \\
&\quad = F(m_1-m_2) + G(n_1-n_2)
\end{aligned}
$$

相对于展平而言，2D-RoPE 更好保持了位置信息，例如对于 $(x,y)$ 展开之后为 $xh + y$，相邻点 $(x+1,y)$ 展平之后为 $xh+y+h$，距离变成了 $h$。

同样对于更高维度的数据(例如 Video 等)，也有对应的 M-RoPE，具体思想也是维度分组，每一组单独做 RoPE。

### NoPE

我们上面讨论的情况都是针对于双向 Attention，但是目前很多大模型都是采用 Decoder-Only + Causal Attention，对于 Causal Attention，计算公式为:

$o_j = \sum_{j \leq i} \mathrm{softmax}(q_i \cdot k_j) v_j$，相当于第 $i$ 个位置只能看到前 $i$ 个 token，所以这种情况下不使用位置编码也可以学习到位置信息，甚至功能利于外推、长度泛化等操作，但是位置信息也更难学习，**RoPE 的作用是显式加上了位置信息，增加了关于位置的先验知识**。

同时苏神博客 [8] 中举了一个均匀分布的例子，说明位置信息存在于输出 $\mathbf y$ 的方差中(这里我们知道输出和位置 $n$ 相关即可)，Causal Attention 中就是使用每一步的序列长度来表示位置的，苏神的主要观点是 Causal Attention 破坏了双向 Attention 的置换不变性，NoPE 虽然可行，但是编码信息比较弱，所以需要 RoPE 提供位置信息的先验知识(emmm, 我理解的大概是这样的)。

Kimi K3 架构中几乎完全抛弃了 RoPE 而是使用了 NoPE，看了一些讨论，主要原因可能是 **Kimi K3 中大部分层都是线性注意力层(KDA)，少量使用 MLA，同时线性 Attention 可能本身已经编码了顺序(状态空间模型)，同时另外还可能是为了多模态统一(例如为图像和视频都要设计对应的 m-RoPE 算法，不如 NoPE 通用)等**。

> 位置编码是有用的先验，而不是必需的组件

## Reference

- [1] https://zhuanlan.zhihu.com/p/454482273
- [2] 苏剑林. (Mar. 23, 2021). 《Transformer升级之路：2、博采众长的旋转式位置编码》[Blog post]. Retrieved from [https://kexue.fm/archives/8265](https://kexue.fm/archives/8265)
- [3] Su, J., Lu, Y., Pan, S., et al. (2023). RoFormer: Enhanced Transformer with Rotary Position Embedding. [arXiv:2104.09864](https://arxiv.org/abs/2104.09864)
- [4] Peng, B., Quesnelle, J., Fan, H., & Shippole, E. (2023). *YaRN: Efficient Context Window Extension of Large Language Models*. [arXiv:2309.00071](https://arxiv.org/abs/2309.00071)
- [5] https://zhuanlan.zhihu.com/p/662790439
- [6] https://zhuanlan.zhihu.com/p/712276260
- [7] 苏剑林. (May. 10, 2021). 《Transformer升级之路：4、二维位置的旋转式位置编码》[Blog post]. Retrieved from [https://spaces.ac.cn/archives/8397](https://spaces.ac.cn/archives/8397)
- [8] 苏剑林. (Sep. 01, 2024). 《Decoder-only的LLM为什么需要位置编码？》[Blog post]. Retrieved from [https://kexue.fm/archives/10347](https://kexue.fm/archives/10347)
