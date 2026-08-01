---
title: 'Redis 缓存实战'
description: 'Redis 数据结构选型、缓存策略、分布式锁与高可用方案'
order: 2
---

## 数据结构选型

| 结构 | 典型场景 | 命令示例 |
|------|----------|----------|
| String | 缓存、计数器、分布式锁 | `SET`, `GET`, `INCR` |
| Hash | 对象存储、用户信息 | `HSET`, `HGET`, `HGETALL` |
| List | 消息队列、时间线 | `LPUSH`, `RPOP`, `LRANGE` |
| Set | 标签、共同好友 | `SADD`, `SINTER`, `SUNION` |
| ZSet | 排行榜、延迟队列 | `ZADD`, `ZRANGE`, `ZREVRANK` |
| Stream | 消息流 | `XADD`, `XREAD`, `XGROUP` |

## 缓存策略

### Cache-Aside（旁路缓存）

```
读：先查缓存 → 命中返回 / 未命中查 DB → 写入缓存 → 返回
写：更新 DB → 删除缓存
```

```go
func GetUser(id string) (*User, error) {
    // 1. 查缓存
    user, err := cache.Get(id)
    if err == nil {
        return user, nil
    }

    // 2. 查数据库
    user, err = db.QueryUser(id)
    if err != nil {
        return nil, err
    }

    // 3. 写入缓存
    cache.Set(id, user, 10*time.Minute)
    return user, nil
}
```

### 缓存常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 缓存穿透 | 查询不存在的数据 | 布隆过滤器、空值缓存 |
| 缓存击穿 | 热点 Key 过期 | 互斥锁、永不过期 + 异步更新 |
| 缓存雪崩 | 大量 Key 同时过期 | 随机过期时间、多级缓存 |

## 分布式锁

### 正确实现

```go
func AcquireLock(key string, ttl time.Duration) (bool, error) {
    // SET key value NX EX ttl
    value := uuid.New().String()
    ok, err := client.SetNX(ctx, key, value, ttl).Result()
    return ok, err
}

func ReleaseLock(key, value string) error {
    // Lua 脚本保证原子性
    script := `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `
    return client.Eval(ctx, script, []string{key}, value).Err()
}
```

**注意**：Redlock 算法在极端情况下可能不安全，推荐使用单个 Redis 实例 + 合理的 TTL。

## 高可用方案

| 方案 | 原理 | CAP |
|------|------|-----|
| 主从复制 | 一主多从，读写分离 | AP |
| Sentinel | 哨兵监控，自动故障转移 | AP |
| Cluster | 数据分片，去中心化 | AP |

## 内存优化

```bash
# 查看内存使用
redis-cli INFO memory

# 查看大 Key
redis-cli --bigkeys

# 查看 Key 的内存占用
redis-cli MEMORY USAGE mykey
```

### 优化建议

- 使用 `hash-max-ziplist-entries` 压缩小 Hash
- 设置合理的 `maxmemory` 和淘汰策略（`allkeys-lru`）
- 避免使用 `KEYS *`，用 `SCAN` 替代
