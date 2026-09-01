export type ResumeContactIcon = 'email' | 'wechat' | 'github' | 'link'

export interface ResumeContact {
  icon: ResumeContactIcon
  label: string
  value: string
  href?: string
}

export interface ResumeSkill {
  label: string
  content?: string
  /** 子条目（用于「软件开发」等按方向分组的模块），非空时以分行样式渲染 */
  items?: string[]
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
  /** 个人职责/角色，单人完成项目可省略 */
  role?: string
  stack: string[]
  description: string
  /** 外部项目链接，缺省时不渲染 GitHub 外链 */
  href?: string
  highlights: string[]
}

export interface ResumeAward {
  /** 奖项全称 */
  content: string
}

export interface ResumeSummary {
  /** 个人评价正文（段落式），与 items 二选一 */
  content?: string
  /** 分点式要点（列表渲染），优先生效 */
  items?: string[]
}

export const resume = {
  name: 'ZhiWei Xiao',
  location: '武汉，中国',
  contacts: [
    {
      icon: 'email',
      label: '邮箱',
      value: 'xiaozhiwei.tech@qq.com',
      href: 'mailto:xiaozhiwei.tech@qq.com'
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
      label: '编程语言',
      content:
        '熟悉 C/C++，掌握 Linux 下网络编程与系统编程，了解 C++ 对象模型与内存模型；熟悉 Go，了解 GMP 调度模型与 GC 算法；熟悉 Python 及 numpy、pandas、matplotlib 等数据分析处理库。'
    },
    {
      label: '软件开发',
      items: [
        '前端：了解 Vue 框架及 Qt 桌面应用开发。',
        '后端：熟悉 MySQL（索引、事务、日志与锁机制）、Redis（底层数据结构、持久化、主从复制）与 Kafka 消息队列，了解微服务、RPC 与服务注册发现等分布式机制。'
      ]
    },
    {
      label: '计算机基础',
      content:
        '熟悉常用数据结构与算法，了解计算机网络、操作系统基本原理；独立完成 MIT 6.S081 Lab，熟悉 Linux 基本使用。'
    },
    {
      label: '嵌入式开发',
      content:
        '掌握 STM32 单片机基本外设与开发流程，熟悉 Linux 基本使用及系统、网络编程，能使用 Verilog 进行 FPGA 开发。'
    },
    {
      label: 'AI',
      items: [
        '深度学习：了解 MLP、CNN、RNN、Transformer 等经典模型，熟悉 PyTorch 的基本使用。',
        '大模型：了解大模型基本架构，以及预训练、微调、后训练各阶段的常用算法与流程。',
        'Agent：熟悉 Agent、Skill、MCP、RAG 等概念，有 Agent 系统搭建经验，熟悉 Claude Code、Codex 等编程工具，了解 DeepSeek Harness 的设计思想。'
      ]
    }
  ] satisfies ResumeSkill[],
  projects: [
    {
      name: 'im-chat & helper-im',
      role: '后端开发',
      stack: ['Go', 'Redis', 'MySQL', 'Kafka', 'WebSocket'],
      description:
        '基于 WebSocket 的即时通讯实践。helper-im 面向校内技术团队，建设私聊、群聊、已读消息与未读会话能力；im-chat 聚焦消息链路与状态同步。',
      href: 'https://github.com/xzwsloser/im',
      highlights: [
        '实现 WebSocket 网关层的心跳检测与消息 ACK 机制，保障消息链路的可靠性。',
        '在 helper-im 中实现私聊、群聊与系统消息的离线存储与在线异步投递，支持上线后的增量同步与断线重连补偿。',
        '基于 Redis 构建服务间轻量消息队列、用户收件箱、未读/已读会话列表、在线状态与热点消息缓存等关键能力。',
        '在 im-chat 中使用 Kafka 异步存储消息，解耦消息收发与持久化链路；网关层基于 Redis 完成 JWT 鉴权。'
      ]
    },
    {
      name: '智慧伴学助手（华为 ICT 大赛创新赛道）',
      stack: ['Python', 'PyTorch', 'YOLOv8', 'MindSpore', 'gRPC', 'Qt'],
      description:
        '面向学习场景的 AI 伴学助手，通过摄像头与多模态深度学习模型实时感知学生状态，并集成知识检索提供学习陪伴与问答辅助。',
      highlights: [
        '基于 YOLOv8 在自定义数据集上微调目标检测模型，识别书本、手机、键盘、人物、手部等 10 类学习相关对象，用于判断学生的专注学习状态。',
        '基于 MindSpore 实现手部关键点（landmark）检测与学习手势、动作识别，实现对低头、玩手机等行为的实时判别。',
        '设计「目标检测 + 姿态估计」级联推理链路，端侧 Qt 客户端与模型服务之间以 gRPC 实现高性能推理通信，完成多模态模型的端到端部署。',
        '集成知识检索问答能力，结合学习内容进行知识问答与陪伴互动。'
      ]
    },
    {
      name: '携程旅游可视化推荐系统（软件课程设计）',
      stack: ['Python', 'PyTorch', 'Milvus', 'gRPC', 'Go', 'Vue'],
      description:
        '基于携程数据构建旅游景点可视化推荐系统，采用「召回—精排—重排」三层推荐架构，覆盖数据爬取、推荐算法、后端服务与前端可视化全链路。',
      href: 'https://github.com/xzwsloser/software_design',
      highlights: [
        '设计双塔向量召回模型：用户塔融合城市、出游类型、兴趣偏好等多类稀疏特征，景点塔融合评分、热度、介绍向量等稠密特征，通过 Embedding 余弦相似度完成向量召回。',
        '针对无点击交互数据的冷启动问题，利用 LLM 从用户评论中自动抽取兴趣维度与偏好标签构建用户画像，缓解特征稀疏，提升冷启动下的推荐质量。',
        '基于 Milvus 向量数据库实现大规模近邻检索，以 gRPC 服务支撑后端高并发调用，保障检索性能与可用性。',
        '使用 PyTorch 完成特征工程、双塔模型训练与评估（含 AUC 等指标），并与 Go 后端、Vue 前端联调落地。'
      ]
    },
    {
      name: 'MIT 6.S081 操作系统实验',
      stack: ['C', 'xv6', 'RISC-V'],
      description:
        '独立完成 MIT 6.S081 操作系统课程的 8 个实验，从系统调用到网络驱动逐步深入 xv6 内核，理解操作系统核心机制。',
      highlights: [
        '完成系统调用（syscall）、多级页表（pgtbl）与陷入（traps）实验，掌握内核进程管理与虚拟内存机制。',
        '实现写时复制（COW），优化 fork 时的内存复制开销，理解共享页面与引用计数等机制。',
        '完成多核并发下的锁优化（lock）、网络设备驱动（net）与 mmap 文件映射（mmap）实验，理解并行与 I/O 子系统。'
      ]
    }
  ] satisfies ResumeProject[],
  awards: [
    { content: '2024/2025 学习优秀奖学金' },
    { content: '第十六届全国大学生数学竞赛省级一等奖' },
    { content: '第十七届全国大学生数学竞赛省级三等奖' },
    { content: '第十三届大学生新一代信息通信科技大赛工程实践赛道（大唐杯）省二等奖' }
  ] satisfies ResumeAward[],
  summary: {
    items: [
      '具备出色的学习能力与自驱力，面对陌生领域能迅速梳理出清晰的学习路线，并循序渐进地系统掌握相关知识。',
      '技术驱动力强，对新技术的演进保持敏锐与好奇，乐于主动探索并将其落地到实际项目中验证价值。',
      '工程与编码功底扎实，在「古法编程」的资源受限条件下也能独立从 0 到 1 手搓复杂项目，打通前后端、算法与硬件，实现端到端的完整闭环。'
    ]
  } as ResumeSummary
}
