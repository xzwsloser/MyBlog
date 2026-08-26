export type ResumeContactIcon = 'email' | 'wechat' | 'github' | 'link'

export interface ResumeContact {
  icon: ResumeContactIcon
  label: string
  value: string
  href?: string
}

export interface ResumeSkill {
  label: string
  content: string
}

export interface ResumeCourse {
  name: string
  score: string
}

export interface ResumeInternshipProject {
  name: string
  participation: string
  description: string
  highlights: string[]
}

export interface ResumeProject {
  name: string
  role: string
  stack: string[]
  description: string
  href: string
  highlights: string[]
}

export const resume = {
  name: 'ZhiWei Xiao',
  location: '武汉，中国',
  contacts: [
    {
      icon: 'email',
      label: '邮箱',
      value: 'u202314382@hust.edu.cn',
      href: 'mailto:u202314382@hust.edu.cn'
    },
    {
      icon: 'wechat',
      label: '微信',
      value: 'xiao88610105'
    },
    {
      icon: 'github',
      label: 'GitHub',
      value: 'xzwsloser',
      href: 'https://github.com/xzwsloser'
    },
    {
      icon: 'link',
      label: '博客',
      value: 'xiaozhiwei.tech',
      href: 'https://xiaozhiwei.tech'
    }
  ] satisfies ResumeContact[],
  education: {
    school: '华中科技大学',
    badges: ['985', '211'],
    degree: '本科',
    college: '电子信息与通信学院',
    major: '通信工程',
    period: '2023.09-2027.07',
    rank: {
      position: 14,
      total: 115
    },
    courses: [
      { name: '概率论', score: '100' },
      { name: '线性代数', score: '93' },
      { name: '微积分上 / 下', score: '98 / 98' },
      { name: '数据结构', score: '92' },
      { name: '电路理论', score: '98' },
      { name: '模拟电子技术', score: '90' },
      { name: '数字电子技术', score: '91' },
      { name: '通信电子线路', score: '93' },
      { name: '通信原理', score: '92' }
    ] satisfies ResumeCourse[]
  },
  internship: {
    company: '字节跳动',
    department: '抖音电商 - 电商独立端 - 服务端',
    period: '2026.05 - 2026.08',
    projects: [
      {
        name: '营销策略中心后台建设与服务迁移切流',
        participation: '技术 Owner',
        description:
          '推动营销策略能力从原触达服务解耦至独立服务，并建设可视化运营后台与可观测的灰度切流能力。',
        highlights: [
          '负责需求分析、技术方案、开发联调与上线，完成新服务工程初始化、存量逻辑迁移、依赖接入及配置读取流程标准化。',
          '设计营销策略、场景、投放模板与投放计划的 B/C 侧模型，落地配置校验、数据异构、自定义接口和审批流程。',
          '针对批量查询与点查并存链路设计分层路由，按场景及策略三元组控制影响面、按用户维度灰度，避免切流造成 RPC 流量放大；补齐监控埋点、Grafana 看板与回滚能力。'
        ]
      },
      {
        name: '金币兑钩子券',
        participation: '核心开发（查询链路与平台能力）',
        description:
          '面向金币限时限量兑券场景，基于营销玩法平台 DAG 编排查询链路，沉淀可复用的平台节点与领域能力。',
        highlights: [
          '参与钩子券查询链路及金币中心、金币兑券页表达层开发，完成活动命中、排期、库存、频控、风控、用户资产与券状态的聚合打包。',
          '开发活动与投放查询、库存查询、用户资产查询、兑换资产对、行为记录及钩子券打包等平台节点和扩展点。',
          '实现兑换资产对与用户资产领域能力，改造 ActionRecord 查询缓存，采用 Cache Aside 保证数据库事实源并支撑高 QPS 查询；参与前端、QA 和下游联调排障。'
        ]
      }
    ] satisfies ResumeInternshipProject[]
  },
  skills: [
    {
      label: 'Go',
      content: '熟悉 Go，了解 GMP 调度模型、内存管理与垃圾回收等机制。'
    },
    {
      label: '编程语言',
      content: '熟悉 C/C++，了解现代 C++ 特性与并发编程；熟悉 Python 的基本使用。'
    },
    {
      label: '数据存储',
      content:
        '熟悉 MySQL，了解索引、事务、日志与锁机制；熟悉 Redis，了解底层数据结构、持久化与主从复制机制。'
    },
    {
      label: '消息队列',
      content: '熟悉 Kafka 的基本使用，了解消息存储、消费与可靠性相关原理。'
    },
    {
      label: '计算机基础',
      content:
        '熟悉常用数据结构与算法，了解计算机网络、操作系统基本原理；独立完成 MIT 6.S081 Lab，熟悉 Linux 基本使用。'
    },
    {
      label: '分布式系统',
      content: '了解微服务、RPC、服务注册与发现等机制，具备分布式系统项目实践。'
    },
    {
      label: 'AI 工程',
      content:
        '了解 RAG、Agent、MCP、Skills 等基本概念，有 RAG 系统搭建经验；了解深度学习原理与 PyTorch 基本使用。'
    }
  ] satisfies ResumeSkill[],
  projects: [
    {
      name: 'TaskGo 分布式定时任务管理平台',
      role: '后端开发',
      stack: ['Go', 'Gin', 'GORM', 'Etcd', 'MySQL', 'GoCron'],
      description:
        '面向团队、实验室与个人的任务统一管理和调度平台，支持多节点部署、主从故障转移、任务自动或手动分配、Shell/HTTP 回调，以及任务失败和节点失活通知。',
      href: 'https://github.com/xzwsloser/TaskGo',
      highlights: [
        '设计并实现 Admin 管理端 API 与 Node 执行端两类服务，完成多节点部署和任务统一调度。',
        '基于 Etcd 实现节点注册、状态监听与故障转移，在节点异常时触发任务自动迁移。',
        '基于 MySQL 与 GORM 建模任务元数据和执行日志，提供任务、日志、节点状态等管理能力。',
        '集成 Cron 秒级调度，支持 Shell 与 HTTP 回调；通过异步 goroutine 和邮件组件发送任务失败、节点失活通知。',
        '实现 JWT 用户鉴权、基于负载均衡算法的任务自动分配，以及基于 Etcd Watcher 的执行节点状态和配置监控。'
      ]
    },
    {
      name: 'im-chat & helper-im',
      role: '后端开发',
      stack: ['Go', 'Redis', 'MySQL', 'Kafka', 'WebSocket'],
      description:
        '基于 WebSocket 的即时通讯实践。helper-im 面向校内技术团队，建设私聊、群聊、已读消息与未读会话能力；im-chat 聚焦消息链路和状态同步。',
      href: 'https://github.com/xzwsloser/im',
      highlights: [
        '实现 WebSocket 网关层的心跳检测与消息 ACK 机制，保障消息链路可靠性。',
        '在 helper-im 中实现私聊、群聊和系统消息的离线存储与在线异步投递，支持上线后的增量同步和断线补偿。',
        '基于 Redis 构建服务间轻量消息队列、用户收件箱、未读/已读会话列表、在线状态与热点消息缓存。',
        '在 im-chat 中使用 Kafka 异步存储消息，解耦消息收发与持久化链路；网关层基于 Redis 完成 JWT 鉴权。'
      ]
    }
  ] satisfies ResumeProject[]
} as const
