---
title: 'CUDA 编程入门'
description: 'CUDA C/C++ 编程基础，核函数编写、内存管理与性能优化'
order: 2
---

## 第一个 CUDA 程序

```cuda
#include <cuda_runtime.h>
#include <stdio.h>

// 核函数：在 GPU 上执行
__global__ void vectorAdd(float* a, float* b, float* c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    int n = 1 << 20;  // 1M 元素
    size_t bytes = n * sizeof(float);

    // 分配主机内存
    float *h_a = (float*)malloc(bytes);
    float *h_b = (float*)malloc(bytes);
    float *h_c = (float*)malloc(bytes);

    // 分配设备内存
    float *d_a, *d_b, *d_c;
    cudaMalloc(&d_a, bytes);
    cudaMalloc(&d_b, bytes);
    cudaMalloc(&d_c, bytes);

    // 数据从主机拷贝到设备
    cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice);

    // 启动核函数
    int threadsPerBlock = 256;
    int blocksPerGrid = (n + threadsPerBlock - 1) / threadsPerBlock;
    vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_a, d_b, d_c, n);

    // 结果从设备拷贝回主机
    cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost);

    // 释放内存
    cudaFree(d_a); cudaFree(d_b); cudaFree(d_c);
    free(h_a); free(h_b); free(h_c);

    return 0;
}
```

## 核函数限定符

| 限定符 | 调用位置 | 执行位置 |
|--------|----------|----------|
| `__global__` | 主机（Host） | 设备（Device） |
| `__device__` | 设备（Device） | 设备（Device） |
| `__host__` | 主机（Host） | 主机（Host） |

## 常用优化技巧

### 1. 减少数据传输

主机与设备之间的数据传输是最大的瓶颈。尽量在 GPU 上完成所有计算再回传结果。

### 2. 使用共享内存

```cuda
__global__ void sharedMemExample(float* data, int n) {
    __shared__ float tile[256];
    int idx = threadIdx.x;
    tile[idx] = data[blockIdx.x * blockDim.x + idx];
    __syncthreads();
    // 在共享内存上操作...
}
```

### 3. 避免 Warp 分歧

```cuda
// 避免这种写法
if (threadIdx.x % 2 == 0) {
    // 偶数线程执行路径 A
} else {
    // 奇数线程执行路径 B
}
// 这会导致同一个 Warp 内线程走不同分支，串行执行
```

## 性能分析工具

- **nvidia-smi**：GPU 状态监控
- **nvprof / Nsight Systems**：性能分析
- **Nsight Compute**：核函数级别分析
