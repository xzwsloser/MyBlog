---
title: 'Go 并发编程'
description: 'Goroutine、Channel、Sync 原语与并发模式详解'
order: 1
---

## Goroutine

Go 的并发核心是 Goroutine——轻量级用户态线程：

```go
package main

import (
    "fmt"
    "time"
)

func sayHello(name string) {
    for i := 0; i < 3; i++ {
        fmt.Printf("Hello, %s!\n", name)
        time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    go sayHello("Alice")   // 启动 goroutine
    go sayHello("Bob")     // 启动另一个 goroutine
    time.Sleep(time.Second) // 等待 goroutine 完成
}
```

## Channel

Channel 是 Goroutine 之间通信的管道。

### 无缓冲 Channel

```go
ch := make(chan int)

go func() {
    ch <- 42  // 发送阻塞，直到有接收者
}()

value := <-ch  // 接收阻塞，直到有发送者
fmt.Println(value) // 42
```

### 带缓冲 Channel

```go
ch := make(chan int, 3) // 容量为 3
ch <- 1
ch <- 2
ch <- 3
// ch <- 4 // 阻塞，缓冲区满了
```

### Select 多路复用

```go
select {
case msg := <-ch1:
    fmt.Println("from ch1:", msg)
case msg := <-ch2:
    fmt.Println("from ch2:", msg)
case <-time.After(1 * time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no message")
}
```

## 并发模式

### Fan-Out / Fan-In

```go
func fanOut(in <-chan int, workers int) []<-chan int {
    outs := make([]<-chan int, workers)
    for i := 0; i < workers; i++ {
        outs[i] = worker(in)
    }
    return outs
}

func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}
```

## Sync 原语

| 原语 | 用途 |
|------|------|
| `sync.Mutex` | 互斥锁 |
| `sync.RWMutex` | 读写锁 |
| `sync.WaitGroup` | 等待一组 goroutine 完成 |
| `sync.Once` | 确保函数只执行一次 |
| `sync.Cond` | 条件变量 |
| `sync.Pool` | 对象池，减少 GC 压力 |

## 常见陷阱

1. **Goroutine 泄漏**：确保每个 goroutine 都有退出路径
2. **Channel 死锁**：注意发送和接收的配对
3. **数据竞争**：用 `go run -race` 检测
4. **闭包变量捕获**：循环中启动 goroutine 时注意变量值
