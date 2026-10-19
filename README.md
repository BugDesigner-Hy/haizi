# 海子的个人网站

> 常年 Java 开发，喜欢鼓捣前端，也做一点能放在桌面上的小工具。

原生 HTML / CSS / JavaScript 写的个人站点，Vite 负责多页面打包。博客和照片用 Markdown 维护，项目列表实时读取 GitHub 仓库，不需要手动登记。

## 页面

| 路径 | 说明 |
| --- | --- |
| `/` | 首页：简介、项目卡片、博客与照片预览 |
| `/blog/` | 文章列表，详情页 `blog/post.html?slug=文章名` |
| `/photos/` | 摄影列表，点击查看大图 |

## 技术栈

- 原生 HTML / CSS / JavaScript，没有前端框架
- [Vite 6](https://vite.dev/) 多页面构建（`index` / `blog` / `post` / `photos` 四个入口）
- [marked](https://marked.js.org/) 渲染 Markdown，frontmatter 由项目内 `js/content.js` 自行解析
- `import.meta.glob` 在构建时收集 `content/**/*.md` 与 `assets/**`，新增文件即生效，无需改代码
- 项目卡片通过 GitHub 公开 API 拉取仓库列表并排序

## 本地运行

需要 Node.js 20 及以上（Vite 6 最低要求 18）。

```bash
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

## 目录结构

```text
.
├─ index.html           # 首页
├─ blog/                # 列表页 index.html、文章页 post.html
├─ photos/              # 摄影列表页
├─ styles.css           # 全站样式
├─ js/                  # 无框架模块：渲染、Markdown、灯箱、页面转场
├─ content/
│  ├─ blog/*.md         # 文章，文件名即 slug
│  ├─ photos/*.md       # 照片说明
│  └─ projects.js       # 项目名称、简介、需要隐藏的仓库
└─ assets/
   ├─ logo.png
   ├─ photos/           # 摄影原图
   └─ projects/         # 项目 logo，文件名与仓库名一致
```

## 写内容

### 新增文章

在 `content/blog/` 下新建 `标题.md`，写好 frontmatter，保存即出现在列表中：

```markdown
---
title: 标题
date: 2026-10-19
location: 银川
summary: 列表里显示的一句话，可以不写
---

正文用 Markdown。
```

`title`、`date`、`location`、`summary` 都可选，缺省时用文件名和日期兜底；`date` 用于排序（新到旧）。

### 新增照片

图片放进 `assets/photos/`，再在 `content/photos/` 建同名 `.md` 写说明：

```markdown
---
date: 2026-10-19
location: 银川
image: assets/photos/名字.jpg
---

旁边的说明也用 Markdown。
```

### 调整项目卡片

`content/projects.js` 里一个仓库一项：

```js
export const projects = {
  yanbian: { name: "延边", desc: "一句话简介" },
};

export const hiddenRepos = new Set(["不想展示的仓库名"]);
```

- 没写 `name` / `desc` 时，用 GitHub 仓库自身的名称和 description
- logo 放进 `assets/projects/`，文件名取仓库名（如 `assets/projects/yanbian.png`）；没有 logo 时卡片显示名称首字
- 卡片链接优先取仓库的 homepage，其次仓库地址

## 部署

`npm run build` 后把 `dist/` 整个目录丢给任意静态托管即可（Nginx、对象存储、Vercel/Netlify、GitHub Pages 都行）。`vite.config.js` 里 `base: "./"` 用的是相对路径，因此不需要额外改配置就能放在子路径下。

## 已知限制

- 项目列表依赖 GitHub 公开 API，匿名请求每小时 60 次；超限或断网时页面显示「项目暂时没有加载出来」，其余内容不受影响。
- 文章与照片在构建时静态收集，改 Markdown 后需要重新构建才会生效（`npm run dev` 下会自动热更新）。

## 版权

个人站点。代码可以参考，文章、照片等内容版权归作者所有。
