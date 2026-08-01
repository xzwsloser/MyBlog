# Astro Theme Pure 博客项目技术分析文档

> 本文档基于对项目源码的完整阅读和分析，旨在帮助开发者快速理解项目结构、技术架构、笔记管理方式以及页面改动的操作流程。

***

## 一、项目概览

**Astro Theme Pure** 是一个基于 Astro 6.x 框架构建的博客主题项目，版本 `4.1.4`。它支持 Markdown 和 MDX 两种内容格式，内置 Waline 评论系统、Pagefind 全文搜索、UnoCSS 样式引擎、KaTeX 数学公式渲染等丰富功能，可部署至 Vercel 平台。

***

## 二、目录结构和文件组织方式

### 2.1 顶层目录结构

```
MyBlog/
├── .github/                  # GitHub 模板（Issue 模板、PR 模板、赞助配置）
│   ├── ISSUE_TEMPLATE/       # Issue 模板文件（bug / feature）
│   ├── assets/               # README 展示图片
│   └── FUNDING.yml           # GitHub 赞助配置
├── .vscode/                  # VS Code 编辑器配置
│   ├── extensions.json       # 推荐扩展列表
│   └── launch.json           # 调试配置
├── packages/                 # 主题核心包（monorepo workspace）
│   └── pure/                 # astro-pure 主题包源码
│       ├── components/       # 主题通用组件
│       │   ├── advanced/     # 高级组件（GitHub Card、MediumZoom、QRCode、Quote 等）
│       │   ├── basic/        # 基础组件（Header、Footer、ThemeProvider）
│       │   ├── pages/        # 页面组件（Hero、TOC、Paginator、PostPreview、BackToTop 等）
│       │   └── user/         # 用户组件（Card、Button、Icon、Collapse、Tabs、Timeline 等）
│       ├── libs/             # 图标库和公共工具
│       ├── plugins/          # 主题插件（remark/rehype 转换器、TOC、外部链接等）
│       ├── schemas/          # Zod 数据校验 schema
│       ├── scripts/          # CLI 脚本（check、new 命令）
│       ├── types/            # TypeScript 类型定义
│       ├── utils/            # 工具函数（日期、阅读时间、样式合并等）
│       └── index.ts          # 主题入口
├── preset/                   # 预设配置和模板
│   ├── components/           # 预设组件（签名组件等）
│   ├── icons/                # 预设 SVG 图标
│   └── scripts/              # 预设脚本（头像缓存）
├── public/                   # 静态资源（直接映射到网站根路径）
│   ├── favicon/              # 网站图标（多尺寸）
│   ├── icons/                # 公共 SVG 图标
│   ├── images/               # 公共图片（社交卡片等）
│   ├── scripts/              # 公共脚本（RSS XSL 样式表）
│   └── links.json            # 友情链接数据
├── scripts/                  # 项目级脚本
│   └── preview.mjs           # 本地预览服务器脚本
├── src/                      # 项目源代码（核心目录）
│   ├── assets/               # 源码级静态资源
│   │   ├── icons/            # SVG 图标
│   │   ├── projects/         # 项目展示图片
│   │   ├── styles/           # 全局样式（global.css、app.css）
│   │   ├── tools/            # 工具图标 SVG
│   │   ├── avatar.png        # 头像
│   │   └── *-qrcode.jpg      # 支付二维码
│   ├── components/           # 页面组件
│   │   ├── about/            # About 页面子组件
│   │   ├── home/             # 首页子组件
│   │   ├── links/            # 友链子组件
│   │   ├── projects/         # 项目页子组件
│   │   ├── waline/           # Waline 评论组件（Comment、PageInfo、Pageview）
│   │   └── BaseHead.astro    # HTML Head 组件
│   ├── content/              # **内容存储目录（笔记核心）**
│   │   ├── blog/             # 博客文章
│   │   └── docs/             # 文档文章
│   ├── layouts/              # 页面布局组件
│   │   ├── BaseLayout.astro      # 基础布局（HTML 骨架）
│   │   ├── BlogPost.astro        # 博客文章布局
│   │   ├── CommonPage.astro      # 通用页面布局
│   │   ├── ContentLayout.astro   # 带侧边栏的内容布局
│   │   └── IndividualPage.astro  # 独立页面布局
│   ├── pages/                # Astro 页面路由
│   │   ├── about/            # 关于页面
│   │   ├── archives/         # 归档页面
│   │   ├── blog/             # 博客列表和详情页
│   │   ├── docs/             # 文档列表和详情页
│   │   ├── links/            # 友链页面
│   │   ├── projects/         # 项目展示页面
│   │   ├── search/           # 搜索页面
│   │   ├── tags/             # 标签页面
│   │   ├── terms/            # 条款页面（版权、隐私、免责等）
│   │   ├── 404.astro         # 404 页面
│   │   ├── index.astro       # 首页
│   │   ├── robots.txt.ts     # robots.txt 生成
│   │   └── rss.xml.ts        # RSS Feed 生成
│   ├── plugins/              # 本地插件
│   │   ├── shiki-official/   # Shiki 代码高亮官方转换器
│   │   ├── rehype-auto-link-headings.ts  # 标题锚点链接
│   │   └── shiki-custom-transformers.ts  # 自定义代码块转换器
│   ├── types/                # TypeScript 类型
│   ├── content.config.ts     # **内容集合配置（笔记 schema 定义）**
│   ├── site.config.ts        # **站点核心配置文件**
│   └── type.d.ts             # 全局类型声明
├── astro.config.ts           # Astro 框架配置
├── eslint.config.mjs         # ESLint 配置
├── package.json              # 项目依赖和脚本
├── prettier.config.mjs       # Prettier 配置
├── tsconfig.json             # TypeScript 配置
├── uno.config.ts             # UnoCSS 配置
└── bun.lock                  # Bun 依赖锁定文件
```

### 2.2 文件组织原则

1. **基于 Astro 文件路由**：`src/pages/` 下的文件结构直接映射为 URL 路由
2. **内容与代码分离**：文章内容存放在 `src/content/` 中，通过 Astro Content Collections API 管理
3. **组件分层**：布局组件在 `src/layouts/`，页面组件在 `src/components/`，主题通用组件在 `packages/pure/components/`
4. **配置集中化**：站点配置集中在 `src/site.config.ts`，内容 schema 定义在 `src/content.config.ts`，Astro 构建配置在 `astro.config.ts`

***

## 三、技术架构和技术栈选型

### 3.1 核心技术栈

| 类别      | 技术            | 版本         | 用途                              |
| ------- | ------------- | ---------- | ------------------------------- |
| **框架**  | Astro         | 6.2.1      | 静态站点生成（SSG），支持 SSR              |
| **运行时** | Bun / Node.js | 1.3+ / 25+ | JavaScript 运行时                  |
| **语言**  | TypeScript    | 6.0.3      | 类型安全                            |
| **样式**  | UnoCSS        | -          | 原子化 CSS 引擎                      |
| **部署**  | Vercel        | -          | 部署平台（`@astrojs/vercel` adapter） |
| **包管理** | Bun           | 1.3+       | 包管理器和脚本运行器                      |

### 3.2 框架与插件生态

| 插件/依赖                                    | 用途                     |
| ---------------------------------------- | ---------------------- |
| `astro-pure`                             | 博客主题核心包（提供组件、工具、样式）    |
| `@astrojs/rss`                           | RSS Feed 生成            |
| `@astrojs/check`                         | Astro 类型检查             |
| `@astrojs/vercel`                        | Vercel 部署适配器           |
| `@waline/client`                         | Waline 评论系统客户端         |
| `katex` + `rehype-katex` + `remark-math` | 数学公式渲染                 |
| `sharp`                                  | 图片处理和优化                |
| `shiki`                                  | 代码语法高亮                 |
| `@pagefind/default-ui`                   | 全文搜索（通过 astro-pure 集成） |

### 3.3 开发工具链

| 工具             | 用途     |
| -------------- | ------ |
| **ESLint**     | 代码规范检查 |
| **Prettier**   | 代码格式化  |
| **TypeScript** | 类型检查   |

### 3.4 架构模式

项目采用 **Astro 岛屿架构（Islands Architecture）**：

- **静态 HTML 优先**：大部分页面在构建时预渲染为静态 HTML
- **客户端交互按需加载**：评论区（Waline）、搜索（Pagefind）、缩放（MediumZoom）等交互组件在客户端按需初始化
- **SSR 模式**：使用 Vercel adapter 的 Server-side Rendering 模式（`output: 'server'`），支持按需动态渲染

### 3.5 页面渲染层级

```
BaseLayout.astro（HTML 骨架 + Header + Footer）
  └── ContentLayout.astro（侧边栏 + 内容区）
        └── BlogPost.astro / CommonPage.astro（具体页面布局）
              └── 具体页面组件（Content 插槽）
```

***

## 四、笔记管理方式（重点）

### 4.1 笔记数据的存储格式和存储位置

#### 存储位置

所有笔记内容存储在 `src/content/` 目录下，分为两个**内容集合（Content Collection）**：

| 集合名    | 目录路径                | 用途   |
| ------ | ------------------- | ---- |
| `blog` | `src/content/blog/` | 博客文章 |
| `docs` | `src/content/docs/` | 文档文章 |

#### 目录组织方式

**博客文章**采用**每篇文章一个子目录**的组织方式：

```
src/content/blog/
├── 3d-rendering/           # 文章 slug 为 "3d-rendering"
│   ├── index.md            # 文章正文
│   ├── thumbnail.jpg       # 封面图
│   ├── nikola-arsov-*.jpg  # 文章内嵌图片
│   └── thanos-dd-*.jpg     # 文章内嵌图片
├── improve-concentration/  # 文章 slug 为 "improve-concentration"
│   ├── index.mdx           # MDX 格式文章
│   └── thumbnail.jpg       # 封面图
├── markdown/               # 文章 slug 为 "markdown"
│   ├── index.md
│   └── thumbnail.jpg
├── markdown-zh/            # 中文版 Markdown 教程
│   ├── index.md
│   └── thumbnail.jpg
├── music-journey/
│   ├── index.md
│   └── thumbnail.jpg
├── draft.md                # 草稿文章（不使用子目录）
├── untitled.md             # 未命名文章
└── using-mdx.mdx           # MDX 教程
```

**文档文章**按分类子目录组织：

```
src/content/docs/
├── advanced/               # 高级主题
│   ├── about.mdx
│   ├── customize.mdx
│   ├── faq.md
│   ├── optimize.mdx
│   └── update.mdx
├── integrations/           # 集成说明
│   ├── advanced.mdx
│   ├── comment.mdx
│   ├── components.mdx
│   └── ...
└── setup/                  # 安装配置
    ├── configuration.md
    ├── content.mdx
    ├── deployment.mdx
    └── getting-started.mdx
```

#### 文件格式

- **`.md`** — 标准 Markdown 格式
- **`.mdx`** — MDX 格式（可在 Markdown 中嵌入 Astro/JSX 组件）

#### Frontmatter 数据格式

每篇文章文件顶部使用 YAML frontmatter 定义元数据。以博客文章为例：

```yaml
---
title: '文章标题'                     # 必填，最长 60 字符
description: '文章描述'               # 必填，最长 160 字符
publishDate: 2025-02-09             # 必填，发布日期
updatedDate: 2025-02-24             # 可选，更新日期
tags:                               # 可选，标签数组
  - Example
  - 3D
language: 'English'                  # 可选，文章语言
heroImage:                          # 可选，封面图
  src: './thumbnail.jpg'            # 图片路径（相对于文章目录）
  color: '#D58388'                  # 主题色（用于页面高亮）
  alt: '图片描述'                    # 可选
draft: false                        # 可选，是否为草稿
comment: true                       # 可选，是否开启评论
---
```

### 4.2 笔记的增删改查实现方式

#### 内容集合配置（`src/content.config.ts`）

项目的笔记管理基于 Astro 的 **Content Collections API**，通过 `src/content.config.ts` 文件定义：

```typescript
// 博客集合定义
const blog = defineCollection({
  // 使用 glob loader 加载 src/content/blog/ 下所有 .md/.mdx 文件
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Zod schema 校验 frontmatter
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),           // 标题（必填）
      description: z.string().max(160),     // 描述（必填）
      publishDate: z.coerce.date(),         // 发布日期（必填）
      updatedDate: z.coerce.date().optional(),
      heroImage: z.object({ src: image(), ... }).optional(),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
      language: z.string().optional(),
      draft: z.boolean().default(false),    // 草稿标记
      comment: z.boolean().default(true)    // 评论开关
    })
})

// 文档集合定义
const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
  schema: () => z.object({
    title: z.string().max(60),
    description: z.string().max(160),
    publishDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    order: z.number().default(999)          // 排序权重
  })
})

export const collections = { blog, docs }
```

#### 增（新建文章）

**方式一：命令行创建**

使用 `bun pure new` 命令（由 `astro-pure` 包的 CLI 脚本提供）：

```bash
bun pure new
```

该命令会交互式引导用户输入标题、描述等，自动生成符合 frontmatter 规范的文章文件。

**方式二：手动创建**

在 `src/content/blog/` 下创建新的子目录和 `index.md` 文件：

```bash
mkdir -p src/content/blog/my-new-post
# 创建 src/content/blog/my-new-post/index.md，填入 frontmatter 和正文
```

**方式三：直接创建 .md 文件**

也可以在 `src/content/blog/` 下直接创建 `.md` 或 `.mdx` 文件（不使用子目录）：

```bash
# 创建 src/content/blog/my-post.md
```

#### 查（读取文章）

**在页面中获取文章列表**（通过 `astro-pure` 提供的服务端工具函数）：

```typescript
import { getBlogCollection, sortMDByDate } from 'astro-pure/server'

// 获取所有博客文章（已排除 draft: true 的文章）
const allPosts = await getBlogCollection()

// 按日期排序
const sortedPosts = sortMDByDate(allPosts)

// 获取文档集合
const docsPosts = await getBlogCollection('docs')
```

**获取单篇文章**（通过 Astro 的 `getStaticPaths` + `render`）：

```typescript
// src/pages/blog/[...id].astro
export async function getStaticPaths() {
  const posts = sortMDByDate(await getBlogCollection())
  return posts.map((post) => ({
    params: { id: post.id },    // post.id 即目录名或文件名（不含扩展名）
    props: { post, posts }
  }))
}

const { post } = Astro.props
const { Content, headings } = await render(post)
// Content 是渲染后的文章组件，headings 是标题结构
```

**文章列表分页**：

```typescript
// 使用 Astro 的 paginate API
export const getStaticPaths = (async ({ paginate }) => {
  const collections = sortMDByDate(await getBlogCollection())
  return paginate(collections, { pageSize: config.content.blogPageSize })
}) satisfies GetStaticPaths
```

**文章过滤**：

- 草稿过滤：`getBlogCollection()` 内部自动过滤 `draft: true` 的文章
- 标签过滤：通过 `getUniqueTagsWithCount()` 按标签分组
- 年份归档：通过 `groupCollectionsByYear()` 按年份分组

#### 改（修改文章）

直接编辑 `src/content/blog/<slug>/index.md` 文件的 frontmatter 或正文内容即可。开发服务器（`bun dev`）会自动热更新。

#### 删（删除文章）

删除对应的文章目录或 `.md` 文件即可：

```bash
rm -rf src/content/blog/my-old-post
```

### 4.3 笔记中图片的管理方式

#### 图片存储位置

笔记中的图片采用 **"与文章同目录存放"** 的策略：

```
src/content/blog/3d-rendering/
├── index.md                                   # 文章正文
├── thumbnail.jpg                              # 封面图（heroImage）
├── nikola-arsov-still-life-interior-*.jpg     # 正文内嵌图片
└── thanos-dd-single-image-004a.jpg            # 正文内嵌图片
```

#### 图片引用方式

**1. 封面图（heroImage）**

在 frontmatter 中通过相对路径引用：

```yaml
heroImage: { src: './thumbnail.jpg', color: '#D58388' }
```

- `src` 使用 `./` 相对路径，指向文章所在目录的图片
- `color` 指定页面主题高亮色
- 封面图在 `BlogPost.astro` 布局中通过 `Hero` 组件渲染

**2. 正文内嵌图片**

在 Markdown 正文中通过标准 Markdown 图片语法引用：

```markdown
![alt text](./nikola-arsov-still-life-interior-design-vray-3ds-max-05-930px.jpg)

![alt text](./thanos-dd-single-image-004a.jpg)
```

#### 图片上传处理逻辑

**没有传统意义上的"上传"流程**。图片管理方式为：

1. 直接将图片文件放入文章目录中
2. 在 Markdown 或 frontmatter 中通过相对路径引用
3. Astro 构建时会自动处理这些图片

#### 构建时图片处理

Astro 通过 `sharp` 库自动处理图片：

1. **`astro.config.ts`** **中配置了图片服务**：
   ```typescript
   image: {
     responsiveStyles: true,
     service: { entrypoint: 'astro/assets/services/sharp' },
     remotePatterns: [{ protocol: 'https' }]
   }
   ```
2. **构建时的图片优化**：
   - 自动生成响应式尺寸
   - 自动格式转换和压缩
   - 自动生成 `srcset` 和 `sizes` 属性
3. **远程图片支持**：
   - 通过 `remotePatterns` 配置允许的远程图片源
   - 在 Markdown 中可直接引用外部 HTTPS 图片 URL
   - `Image` 组件支持 `inferSize` 自动推断远程图片尺寸
4. **SVG 优化**：
   ```typescript
   experimental: {
     svgOptimizer: svgoOptimizer(),
   }
   ```

#### RSS Feed 中的图片处理

`src/pages/rss.xml.ts` 中特殊处理了图片路径，确保 RSS 输出中的图片使用绝对 URL：

```typescript
function remarkReplaceImageLink() {
  return async (tree: Root) => {
    visit(tree, 'image', (node) => {
      if (node.url.startsWith('/images')) {
        node.url = `${site}${node.url.replace('/', '')}`
      } else {
        // 相对路径图片转为 Astro 优化后的绝对 URL
        const imagePathPrefix = `/src/content/blog/${post.id}/${node.url.replace('./', '')}`
        // 通过 import.meta.glob 动态获取并处理图片
      }
    })
  }
}
```

#### 图片访问路径配置

**开发模式**：Vite 开发服务器直接服务源文件路径

**构建后**：

- 图片经过 `sharp` 优化后输出到 `dist/client/_astro/` 目录
- 文件名包含内容哈希（如 `thumbnail.1GZ294Dz.jpg`）
- 构建时配置了长期缓存：`cache-control: public, max-age=31536000, immutable`

**远程图片**：通过 `remotePatterns: [{ protocol: 'https' }]` 允许加载任何 HTTPS 图片源

#### MediumZoom 图片缩放

项目集成了 MediumZoom 图片缩放功能：

```typescript
// site.config.ts
mediumZoom: {
  enable: true,
  selector: '.prose .zoomable',
  options: { className: 'zoomable' }
}
```

文章正文中的图片会自动添加 `zoomable` 类名，点击可放大查看。

***

## 五、页面改动操作指南

### 5.1 改动流程图

```
确认改动需求
    │
    ▼
定位需要修改的文件
    │
    ├── 修改内容 → src/content/blog/ 或 src/content/docs/
    ├── 修改配置 → src/site.config.ts
    ├── 修改样式 → src/assets/styles/ 或 uno.config.ts
    ├── 修改页面结构 → src/pages/ 或 src/layouts/
    └── 修改组件 → src/components/ 或 packages/pure/components/
    │
    ▼
本地开发验证（bun dev）
    │
    ▼
构建验证（bun run build）
    │
    ▼
预览验证（bun preview）
```

### 5.2 常见改动场景及操作步骤

#### 场景一：修改站点基本信息

**需要修改的文件**：`src/site.config.ts`

```typescript
export const theme: ThemeUserConfig = {
  title: '你的网站标题',          // 修改网站标题
  author: '你的名字',             // 修改作者
  description: '网站描述',        // 修改描述
  favicon: '/favicon/favicon.ico',
  socialCard: '/images/social-card.png',
  logo: {
    src: '/src/assets/avatar.png', // 替换头像
    alt: 'Avatar'
  },
  header: {
    menu: [                        // 修改导航菜单
      { title: 'Blog', link: '/blog' },
      // 添加或删除菜单项
    ]
  },
  footer: {
    // 修改页脚信息
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/xxx' },
    ]
  },
  content: {
    blogPageSize: 8,               // 修改每页文章数
    share: ['weibo', 'x', 'bluesky']
  }
}
```

#### 场景二：新增/修改博客文章

**操作步骤**：

1. 在 `src/content/blog/` 下创建新目录（如 `my-article/`）
2. 在目录中创建 `index.md` 文件，填写 frontmatter 和正文
3. 将文章图片放在同目录下
4. 运行 `bun dev` 预览效果

**注意事项**：

- `draft: true` 的文章在列表页不可见，但可通过直接 URL 访问
- 确保 `title`（≤60 字符）和 `description`（≤160 字符）满足长度限制

#### 场景三：修改页面布局

**需要修改的文件**（按层级）：

| 层级        | 文件                                 | 作用                       |
| --------- | ---------------------------------- | ------------------------ |
| HTML 骨架   | `src/layouts/BaseLayout.astro`     | 全局 HTML 结构、Header、Footer |
| 内容布局      | `src/layouts/ContentLayout.astro`  | 侧边栏 + 内容区布局              |
| 博客布局      | `src/layouts/BlogPost.astro`       | 博客文章页特有元素（Hero、TOC、评论）   |
| 通用页面      | `src/layouts/CommonPage.astro`     | 通用页面布局                   |
| 独立页面      | `src/layouts/IndividualPage.astro` | MDX/MD 独立页面布局            |
| HTML Head | `src/components/BaseHead.astro`    | SEO 元标签、社交分享标签           |

**示例：修改文章页布局**

1. 编辑 `src/layouts/BlogPost.astro`
2. 调整 `Hero`、`TOC`、`Copyright`、`Comment` 等组件的位置和属性
3. 运行 `bun dev` 实时预览

#### 场景四：修改样式

**需要修改的文件**：

| 文件                             | 作用                     |
| ------------------------------ | ---------------------- |
| `src/assets/styles/global.css` | 全局样式（动画、代码块、滚动条等）      |
| `src/assets/styles/app.css`    | 主题色彩变量（亮色/暗色模式）        |
| `uno.config.ts`                | UnoCSS 配置（排版样式、颜色、工具类） |

**修改主题色**：

1. 编辑 `src/assets/styles/app.css`
2. 修改 `:root` 和 `.dark` 中的 CSS 变量：
   ```css
   :root {
     --primary: 200 29% 45%;  /* 修改主色调 */
     --background: 210 33% 99%;
     /* ... */
   }
   ```

#### 场景五：添加新页面

1. 在 `src/pages/` 下创建 `.astro` 文件（如 `src/pages/gallery/index.astro`）
2. 选择合适的布局组件：
   ```astro
   ---
   import PageLayout from '@/layouts/BaseLayout.astro'
   // 或 CommonPage、ContentLayout 等
   ---
   <PageLayout meta={{ title: 'Gallery', description: '...' }}>
     <!-- 页面内容 -->
   </PageLayout>
   ```
3. 如需在导航中添加链接，编辑 `src/site.config.ts` 的 `header.menu`

#### 场景六：修改内容 Schema

编辑 `src/content.config.ts`，修改 Zod schema：

```typescript
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      // 添加新字段
      category: z.string().optional(),
      featured: z.boolean().default(false),
      // 修改现有字段
      title: z.string().max(100),  // 放宽长度限制
      // ...
    })
})
```

### 5.3 注意事项

1. **TypeScript 类型安全**：修改 `content.config.ts` 的 schema 后，需要同步更新 `src/type.d.ts` 中的类型声明
2. **路径别名**：项目配置了路径别名，在 import 时使用：
   - `@/components/*` → `./src/components/*`
   - `@/layouts/*` → `./src/layouts/*`
   - `@/assets/*` → `./src/assets/*`
   - `@/site-config` → `./src/site.config.ts`
3. **构建与部署**：
   - 开发：`bun dev`
   - 构建：`bun run build`
   - 预览构建产物：`bun preview`
   - 部署到 Vercel 需要 `@astrojs/vercel` adapter（已配置）
4. **字体处理**：当前项目使用系统字体栈（`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`），如需要自定义 Web 字体，可在 `astro.config.ts` 中配置 `fonts` 选项
5. **评论系统**：Waline 评论系统需在 `site.config.ts` 的 `integ.waline` 中配置后端服务器地址
6. **搜索功能**：Pagefind 搜索在 `bun run build` 时自动生成索引，依赖 `content.blogPageSize` 的分页设置
7. **图片处理**：项目使用 `sharp` 进行图片优化，构建时自动处理。大型图片建议提前压缩以加快构建速度
8. **热更新**：开发模式下修改 `src/content/` 中的文章、`src/site.config.ts` 配置均支持热更新

***

## 六、补充说明

### 6.1 本地预览服务器

由于 `@astrojs/vercel` adapter 不支持 `astro preview` 命令，项目自定义了预览脚本 `scripts/preview.mjs`。它会：

1. 启动 HTTP 服务器
2. 优先服务 `dist/client/` 中的静态文件
3. 静态文件未命中时，交给 Vercel Serverless Function 入口处理（SSR 路由）
4. 自动处理端口冲突（最多尝试 10 个端口）

### 6.2 关键技术特性

- **暗色模式**：通过 `ThemeProvider` 组件和 CSS 变量自动支持
- **代码高亮**：Shiki 引擎 + 自定义转换器（标题、语言标签、复制按钮、折叠按钮、diff 高亮）
- **数学公式**：KaTeX 引擎，支持行内公式和块级公式
- **RSS**：自动生成 RSS 2.0 Feed（`/rss.xml`）
- **Sitemap**：自动生成 sitemap（通过 `astro-pure` 集成）
- **SEO**：完整的 Open Graph 和 Twitter Card 元标签
- **预渲染**：博客和文档文章在构建时预渲染为静态 HTML（`prerender: true`）
- **图片缩放**：MediumZoom 集成（`.zoomable` 选择器）
- **搜索**：Pagefind 全文搜索（构建时生成索引）

