---
name: feishu-to-hugo-blog
description: 将飞书 Wiki/Docx 长文完整转换为 Hugo + PaperMod 博客文章并发布。适用于用户给出 feishu.cn/wiki 或 /docx/ 链接，要求保留正文、公式、图片与题注、目录结构，并做美观排版、构建、推送部署的场景。
---

# 飞书文档 → Hugo 博客

把一篇飞书长文迁移成本仓库的博客文章：内容不丢、公式可读、版式统一、图片题注保留，最后构建并推送部署。

## 适用与前置

- 仓库：Hugo + PaperMod，文章在 `content/posts/<slug>/index.md`，图片放同目录 `images/`。
- 工具：`lark-cli`（已登录用户身份）、`hugo`（仓库 `node_modules/.bin/hugo`）、`google-chrome-stable` + `pdftoppm`（视觉验收，可选）。
- 飞书读取需要 `lark-cli` 刷新本地 token 缓存；若沙箱只允许写工作区，需一次性放宽到 `danger-full-access`，否则会报 `keychain Set failed: ... read-only file system`。

## 工作流

### 1. 解析节点

```bash
lark-cli wiki +node-get --node-token '<wiki url>' --format json
```

记录 `obj_token`、`obj_type`、`title`、`obj_create_time`、`obj_edit_time`。`/wiki/` 链接必须用 `--node-token`，不是 `--url`。

### 2. 拉取正文（Markdown + XML 双份）

```bash
lark-cli docs +fetch --doc '<wiki url>' --doc-format markdown --detail simple > .larkdoc/doc.md
lark-cli docs +fetch --doc '<wiki url>' --doc-format xml --detail with-ids > .larkdoc/doc.xml
```

输出是 JSON 包装，取 `data.document.content` 写入 `.md` / `.xml`。Markdown 用于正文，XML 用于还原：

- `<img src="file_token" caption="..." alt="...">` 的 token、题注、alt；
- `<callout emoji=...>` 高亮块；
- 标题层级、代码块语言、列表结构。

### 3. 下载图片

```bash
mkdir -p content/posts/<slug>/images
lark-cli docs +media-download --token '<file_token>' \
  --output content/posts/<slug>/images/<semantic-name>.png --as user --overwrite
```

- 用语义化文件名（`pe-distribution.png`），不要保留 `image.png`。
- 逐张确认文件非空、尺寸合理；用 `read_image` 抽查。
- 题注优先取 XML `caption`；没有 caption 但有 `alt` 的，把 alt 原文写入 `alt` 属性保留，另写一句简短可见题注。
- 没有 caption/alt 的图，从上下文“左图/中图/右图”提炼一句题注，不新增事实。

### 4. 建页面包

```
content/posts/<slug>/
├── index.md
└── images/
    ├── transformer-architecture.png
    └── ...
```

Front matter 模板：

```yaml
---
title: "原文标题"
date: 2026-11-03T12:00:00+08:00
lastmod: 2026-11-03T12:00:00+08:00
draft: false
author: "ZhiWei Xiao"
description: "一句话摘要"
summary: "列表页摘要"
tags: ["大模型", "Transformer", "位置编码", "RoPE", "YaRN"]
categories: ["大模型架构"]
ShowToc: true
TocOpen: true
UseHugoToc: true
ShowCodeCopyButtons: false
math: true
---
```

### 5. 版式约定

- **高亮块**：`{{% callout emoji="🤔" title="Q & A" type="qa" %}}`；`type` 取 `note` / `qa`。
- **性质/要点列表**：`{{% feature-list %}}` 包住一个 Markdown 列表，列表项首行加粗作为卡片标题，后续内容缩进 2 空格。
- **图片**：`{{< figure src="images/x.png" alt="..." caption="..." >}}`，题注会渲染在图下方。
- **代码**：普通 fenced code block 即可，`layouts/_markup/render-codeblock.html` 会生成带语言栏和复制按钮的卡片。
- **公式**：行内 `$...$`，独立公式 `$$` 单独成行并上下留空行；多行公式用 `\begin{aligned}...\end{aligned}`。
- **目录**：`ShowToc + UseHugoToc` 自动生成，标题层级保持原文。
- 引用块直接用 `>`；样式由 `assets/css/extended/blog.css` 统一。

### 6. 构建与视觉验收

```bash
node_modules/.bin/hugo --gc --minify --cleanDestinationDir --destination dist
node_modules/.bin/hugo server --port 1313 --bind 127.0.0.1 --disableFastRender
```

- 用 Chrome DevTools Protocol 分段截图（见 `references/visual-qa.md`），检查首屏、每个 h2/h3、代码块、公式、图注。
- 重点看：公式是否换行正确、长公式是否溢出、代码是否被截断、图片是否加载、题注是否在。

### 7. 提交与部署

```bash
git add content/posts/<slug> assets/css layouts hugo.toml i18n
git commit -m "feat: add <title>"
git push origin main
```

`.github/workflows/deploy.yml` 在 push 到 `main/master` 时构建并部署。推送后确认 Actions 成功，再访问线上 URL 复核。

## 高频坑（务必检查）

1. **百分号 shortcode 首行不渲染**：`{{% callout %}}` 后必须空一行，`{{% /callout %}}` 前也要空一行，否则第一段会以原始 Markdown 文本输出。
2. **shortcode 被当 raw HTML 丢弃**：`hugo.toml` 需要 `[markup.goldmark.renderer] unsafe = true`，否则 callout/feature-list 整块消失。
3. **公式直通**：需要 `[markup.goldmark.extensions.passthrough]`，块级 `$$`、行内 `$` 都要注册；否则 `\\` 会被 Markdown 吃掉。
4. **`$$` 块内以 `+`/`-`/`*` 开头的行**会被 Goldmark 当列表，导致整个公式块失效。把运算符放在上一行末尾，或把续行写成 `&\quad + ...`。
5. **裸 `<`/`>`**：`<f(x), g(y)>` 会被浏览器当 HTML 标签吃掉，改成 `\langle ... \rangle`。
6. **项目 `layouts/page.html` 会接管所有普通页**：文章需要 `layouts/posts/page.html`（PaperMod `single.html` 的副本）才能拿到 post header、meta、TOC、tags。
7. **图片懒加载**：截图/打印前把所有 `img.loading` 设为 `eager` 并滚到底，否则长文后半段图片空白。
8. **内容校对**：只做错别字、标点、明显笔误的润色；技术表述、公式含义不改。逐段对照原文检查漏段。

## 交付清单

- [ ] 标题、日期、标签、分类、摘要
- [ ] 全部正文段落与列表
- [ ] 全部公式可渲染，多行公式对齐
- [ ] 全部图片本地化，题注/描述保留
- [ ] 代码块语言正确、可复制
- [ ] 目录层级与原文一致
- [ ] 移动端宽度下无横向溢出
- [ ] `hugo` 构建零警告（raw HTML 警告已消除）
- [ ] commit + push + Actions 成功
