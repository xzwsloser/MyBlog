---
title: 'MySQL 查询优化'
description: '索引原理、执行计划分析、慢查询优化与分库分表策略'
order: 1
---

## 索引原理

### B+ 树索引

MySQL InnoDB 默认使用 B+ 树索引。所有数据存储在叶子节点，非叶子节点仅存储键值用于导航。

```
        [30 | 70]
       /    |    \
  [10|20] [40|50|60] [80|90]
    ↓        ↓          ↓
  Data     Data       Data
```

### 聚集索引 vs 二级索引

| 类型 | 叶子节点存储 | 特点 |
|------|-------------|------|
| 聚集索引 | 完整行数据 | 一个表只有一个，通常是主键 |
| 二级索引 | 主键值 | 回表查询需要额外一次 IO |

## 执行计划分析

```sql
EXPLAIN SELECT * FROM users
WHERE age > 25 AND city = 'Beijing'
ORDER BY created_at DESC
LIMIT 10;
```

关键字段解读：

| 字段 | 含义 | 优化目标 |
|------|------|----------|
| `type` | 访问类型 | 至少达到 `range`，最好 `const`/`ref` |
| `key` | 使用的索引 | 确保用上了合适的索引 |
| `rows` | 扫描行数 | 越小越好 |
| `Extra` | 额外信息 | 避免 `Using filesort`、`Using temporary` |

### 访问类型优先级

```
system > const > eq_ref > ref > range > index > ALL
                                      ↑ 至少要到这个
```

## 慢查询优化策略

### 1. 覆盖索引

```sql
-- 差：需要回表
SELECT * FROM users WHERE email = 'test@example.com';

-- 好：覆盖索引，不需要回表
CREATE INDEX idx_email_name ON users(email, name);
SELECT email, name FROM users WHERE email = 'test@example.com';
```

### 2. 最左前缀原则

```sql
CREATE INDEX idx_a_b_c ON table1(a, b, c);

-- 能用到索引
WHERE a = 1                    -- ✅ 用到 a
WHERE a = 1 AND b = 2          -- ✅ 用到 a, b
WHERE a = 1 AND b = 2 AND c = 3 -- ✅ 用到 a, b, c

-- 不能完全用到索引
WHERE b = 2                    -- ❌ 跳过 a
WHERE a = 1 AND c = 3          -- ⚠️ 只用到 a
```

### 3. 避免索引失效

```sql
-- ❌ 函数操作导致索引失效
WHERE DATE(created_at) = '2026-01-01'

-- ✅ 使用范围查询
WHERE created_at >= '2026-01-01' AND created_at < '2026-01-02'

-- ❌ 隐式类型转换
WHERE phone = 13800138000  -- phone 是 varchar

-- ✅ 保持类型一致
WHERE phone = '13800138000'
```

## 分库分表

| 策略 | 适用场景 | 挑战 |
|------|----------|------|
| 垂直分库 | 按业务拆分 | 跨库 Join |
| 水平分表 | 单表数据量大 | 分布式 ID、跨分片查询 |
| 读写分离 | 读多写少 | 主从延迟 |

## 常用诊断命令

```sql
-- 查看当前正在执行的查询
SHOW PROCESSLIST;

-- 查看慢查询日志配置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看索引使用情况
SHOW INDEX FROM users;
```
