# 内容创建与管理指南

> 本文档详细说明如何在 Astro Theme Pure 项目中创建和管理博客文章与学习笔记。

---

## 第一部分：博客文章（Blog）

博客文章存放在 `src/content/blog/`，面向按时间排序的文章（随笔、技术文章、新闻等）。

### 一、快速开始

#### 方式一：命令行创建（推荐）

```shell
bun pure new
```

执行后会引导你输入文章标题、描述等信息，自动生成符合规范的 Markdown 文件。

#### 方式二：手动创建

**步骤 1：创建文章目录**

```shell
mkdir -p src/content/blog/my-article-slug
```

文章 URL 为 `/blog/my-article-slug`，目录名即 slug。

**步骤 2：创建 `index.md` 文件**

```shell
touch src/content/blog/my-article-slug/index.md
```

**步骤 3：填写 Frontmatter**

```yaml
---
title: '文章标题'
publishDate: 2026-08-01
description: '文章简短描述'
tags:
  - 标签1
  - 标签2
language: 'Chinese'
heroImage: { src: './thumbnail.jpg', color: '#4A90D9' }
---
```

**步骤 4：编写正文**

在 frontmatter 下方（`---` 之后）编写 Markdown 正文。

### 二、Frontmatter 字段

#### 必填字段

| 字段 | 类型 | 长度限制 | 说明 |
|------|------|----------|------|
| `title` | `string` | ≤ 60 字符 | 文章标题 |
| `description` | `string` | ≤ 160 字符 | 文章描述（SEO、列表预览） |
| `publishDate` | `date` | — | 发布日期，如 `2026-08-01` |

#### 可选字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `updatedDate` | `date` | — | 更新日期 |
| `tags` | `string[]` | `[]` | 标签（自动转小写、去重） |
| `language` | `string` | — | 语言，如 `'Chinese'` |
| `heroImage` | `object` | — | 封面图配置 |
| `draft` | `boolean` | `false` | 草稿模式 |
| `comment` | `boolean` | `true` | 评论开关 |

#### heroImage 配置

```yaml
heroImage:
  src: './thumbnail.jpg'
  color: '#4A90D9'
  alt: '封面图描述'
```

### 三、标签管理

标签用于分类和检索，每个标签自动生成独立页面 `/tags/<tag-name>/`：

```yaml
tags:
  - TypeScript
  - Frontend
  - Tutorial
```

### 四、归档

文章自动按年份分组，归档页面 URL：`/archives`。

### 五、草稿管理

设置 `draft: true` 后文章在列表中隐藏，但直接 URL 仍可访问。改为 `false` 即发布。

### 六、图片管理

文章图片放在文章目录中，通过相对路径引用：

```
src/content/blog/my-article/
├── index.md
├── thumbnail.jpg     # 封面图
└── diagram.png       # 正文图片
```

```markdown
![图片](./diagram.png)
```

构建时 `sharp` 会自动优化图片，输出到 `dist/client/_astro/` 目录。

### 七、排序与分页

文章默认按 `publishDate` 降序排列。分页数在 `src/site.config.ts` 中配置：

```typescript
content: {
  blogPageSize: 8,
}
```

---

## 第二部分：学习笔记（Docs）

笔记存放在 `src/content/docs/`，面向体系化知识（教程、手册、知识库等）。通过目录层级实现模块 → 子模块的组织方式，侧边栏自动生成导航。

### 一、目录结构

```
src/content/docs/
├── ai-infra/                    # 一级目录 = 模块分类
│   ├── overview/index.md        # 模块概述
│   ├── gpu/                     # 二级目录 = 子模块
│   │   ├── gpu-architecture.md
│   │   └── cuda-programming.md
│   ├── training/
│   │   ├── distributed-training.md
│   │   └── mixed-precision.md
│   └── inference/
│       └── model-optimization.md
├── backend/
│   ├── overview/index.md
│   ├── golang/
│   │   └── concurrency.md
│   └── database/
│       ├── mysql-optimization.md
│       └── redis-caching.md
```

**URL 规则**：文件路径直接映射为 URL

```
src/content/docs/ai-infra/gpu/cuda-programming.md  →  /docs/ai-infra/gpu/cuda-programming
src/content/docs/backend/golang/concurrency.md      →  /docs/backend/golang/concurrency
```

### 二、创建笔记

#### 方式一：命令行创建

```shell
bun pure new
```

选择 docs 类型即可。

#### 方式二：手动创建

**步骤 1：创建目录和文件**

```shell
mkdir -p src/content/docs/ai-infra/gpu
touch src/content/docs/ai-infra/gpu/my-note.md
```

**步骤 2：填写 Frontmatter**

```yaml
---
title: '笔记标题'
description: '笔记描述'
order: 1           # 排序权重，数字越小越靠前
---
```

**步骤 3：编写正文**

编写 Markdown 正文内容。

### 三、Frontmatter 字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:--:|--------|------|
| `title` | `string` | 是 | — | 笔记标题（≤ 60 字符） |
| `description` | `string` | 是 | — | 笔记描述（≤ 160 字符） |
| `order` | `number` | 否 | `999` | **排序权重**，越小越靠前 |
| `publishDate` | `date` | 否 | — | 发布日期 |
| `updatedDate` | `date` | 否 | — | 更新日期 |
| `tags` | `string[]` | 否 | `[]` | 标签 |
| `draft` | `boolean` | 否 | `false` | 草稿模式 |

**注意**：docs 的 frontmatter 比 blog 简单，没有 `heroImage`、`language`、`comment` 等字段。

### 四、排序规则

笔记按 `order` 字段**升序**排列（与 blog 按日期降序不同）。同一分类下的笔记按 `order` 从小到大显示。

```yaml
# 概述放最前面
---
title: 'AI Infra 概述'
order: 1
---

# 具体笔记按 order 排序
---
title: 'GPU 架构基础'
order: 2
---
```

### 五、添加新模块分类

当前模块分类在 `src/pages/docs/DocsContents.astro` 中配置：

```typescript
const docCategories = {
  'ai-infra': 'AI Infra',
  backend: 'Backend Development'
}
```

**添加新模块**：

1. 在 `src/content/docs/` 下创建新的一级目录，如 `src/content/docs/frontend/`
2. 在 `DocsContents.astro` 中添加映射：

```typescript
const docCategories = {
  'ai-infra': 'AI Infra',
  backend: 'Backend Development',
  frontend: 'Frontend'    // ← 新增
}
```

3. 新模块下的所有笔记会自动出现在侧边栏导航中。

### 六、侧边栏导航原理

`DocsContents.astro` 组件的工作原理：

1. 读取 `src/content/docs/` 下所有 `.md` 文件
2. 按文件路径的第一级目录分组（如 `ai-infra/`、`backend/`）
3. 按 `order` 字段排序
4. 生成带分类标签的侧边栏目录树
5. 客户端脚本自动高亮当前页面

### 七、笔记 vs 博客：选择指南

| 维度 | Blog（博客） | Docs（笔记） |
|------|-------------|-------------|
| **存储位置** | `src/content/blog/` | `src/content/docs/` |
| **定位** | 按时间排序的文章 | 按分类组织的知识 |
| **排序** | 按 `publishDate` 降序 | 按 `order` 升序 |
| **导航** | 列表 + 标签 + 归档 | 侧边栏分类目录树 |
| **分页** | 支持 | 不支持（所有笔记在一个导航中） |
| **标签** | 支持，自动生成标签页 | 支持但不自动生成标签页 |
| **RSS** | 自动包含 | 不包含 |
| **搜索** | Pagefind 自动索引 | Pagefind 自动索引 |
| **heroImage** | 支持封面图 | 不支持 |
| **评论** | 支持 | 不支持 |
| **典型场景** | 随笔、技术文章、新闻 | 知识库、教程、手册 |

---

## 第三部分：项目展示页（Projects）

Projects 页面（`/projects`）是**手写 `.astro` 页面**，不走内容集合。所有内容直接在 `src/pages/projects/index.astro` 中硬编码。

### 一、页面结构

```astro
---
import ProjectSection from '@/components/projects/ProjectSection.astro'
// ...
---

<PageLayout title='Projects'>
  <ProjectSection
    projects={[
      {
        name: '项目名称',
        description: '项目描述',
        links: [
          { type: 'github', href: 'https://github.com/xzwsloser' },
          { type: 'site', href: '/' }
        ]
      }
    ]}
  />
</PageLayout>
```

### 二、ProjectSection 组件

每个项目卡片由 `ProjectSection` 组件渲染，支持以下链接类型：

| type | 图标 | 用途 |
|------|------|------|
| `github` | GitHub 图标 | 链接到 GitHub 仓库 |
| `site` | 网站图标 | 链接到项目网站 |
| `doc` | 文档图标 | 链接到文档 |
| `release` | 发布图标 | 链接到 Release 页面 |

### 三、GitHub 活动图

页面顶部的 GitHub 活动热力图通过 `ghchart.rshah.org` 生成：

```astro
<Image
  src='https://ghchart.rshah.org/659eb9/xzwsloser'
  alt='github activities'
  inferSize
/>
```

修改 URL 中的 GitHub 用户名即可更换。

### 四、修改项目列表

直接编辑 `src/pages/projects/index.astro`，在 `projects={[...]}` 数组中增删项目：

```typescript
projects={[
  {
    name: '新项目',
    description: '项目描述',
    links: [
      { type: 'github', href: 'https://github.com/xzwsloser/new-project' },
      { type: 'site', href: 'https://project-demo.vercel.app' }
    ]
  }
]}
```

### 五、页脚 GitHub 链接

页脚的 GitHub 社交图标在 `src/site.config.ts` 中配置：

```typescript
footer: {
  social: [
    { icon: 'github', label: 'GitHub', href: 'https://github.com/xzwsloser' },
    { icon: 'rss', label: 'RSS', href: '/rss.xml' }
  ]
}
```

---

## 第四部分：其他手写页面

以下页面也是手写 `.astro` 文件，不走内容集合，直接编辑即可修改内容：

| 页面 | 文件 | 数据来源 |
|------|------|----------|
| About 页 | `src/pages/about/index.astro` | 硬编码 |
| Links 页 | `src/pages/links/index.astro` | `public/links.json` + 硬编码 |
| Search 页 | `src/pages/search/index.astro` | Pagefind 自动索引 |
| 导航菜单 | `src/site.config.ts` → `header.menu` | 配置文件 |
| 页脚信息 | `src/site.config.ts` → `footer` | 配置文件 |

---

## 第五部分：通用操作

### 预览与发布

```shell
# 启动开发服务器
bun dev

# 构建
bun run build

# 预览构建产物
bun preview
```

开发服务器启动后访问对应 URL 预览：

| 内容类型 | URL 格式 |
|----------|----------|
| 博客文章 | `http://localhost:4321/blog/<slug>` |
| 学习笔记 | `http://localhost:4321/docs/<path>` |
| 博客列表 | `http://localhost:4321/blog` |
| 笔记首页 | `http://localhost:4321/docs` |

### 草稿管理

两种内容类型都支持 `draft: true`，草稿在列表中隐藏但直接 URL 可访问。

### 图片管理

图片统一放在内容文件所在目录中，通过 `./` 相对路径引用。构建时 `sharp` 自动优化。

### 常见问题

**Q: 笔记如何修改排序？**

修改 frontmatter 中的 `order` 字段，数字越小越靠前。

**Q: 如何添加新的模块分类？**

1. 在 `src/content/docs/` 下创建新目录
2. 在 `src/pages/docs/DocsContents.astro` 中添加分类映射

**Q: 笔记 URL 如何确定？**

URL = `/docs/` + 文件相对于 `src/content/docs/` 的路径（去掉 `.md` 扩展名）。

**Q: 图片在构建后找不到？**

确保图片路径使用 `./` 相对路径，且图片文件存在于内容文件所在目录中。
