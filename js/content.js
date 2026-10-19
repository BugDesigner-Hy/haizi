/**
 * 文章：新建 content/blog/标题.md，保存后就会出现，不用登记。
 *
 * ---
 * title: 标题
 * date: 2026-10-19
 * location: 银川
 * summary: 列表里的一句话，可以不写
 * ---
 *
 * 正文用 Markdown。
 *
 * 照片：图片放进 assets/photos/，说明写成 content/photos/名字.md。
 *
 * ---
 * date: 2026-10-19
 * location: 银川
 * image: assets/photos/名字.jpg
 * ---
 *
 * 旁边的说明也用 Markdown。
 *
 * 项目名称和简介在 content/projects.js。没写简介时，用 GitHub 仓库的 description。
 * 项目 logo 放进 assets/projects/，文件名用仓库名，例如 assets/projects/yanbian.png。
 * 没有 logo 时，卡片上显示项目名的首字母。
 */

const blogSources = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const photoSources = import.meta.glob("../content/photos/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const assetUrls = import.meta.glob("../assets/**/*.{png,jpg,jpeg,gif,webp,svg}", {
  query: "?url",
  import: "default",
  eager: true,
});

export function parseFrontmatter(source) {
  const text = String(source).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return { meta: {}, body: text.trim() };

  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: text.trim() };

  const meta = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[match[1]] = value;
  }

  return { meta, body: text.slice(end + 5).trim() };
}

export function resolveAsset(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|data:)/i.test(trimmed) || trimmed.startsWith("#")) return trimmed;
  if (/^\s*javascript:/i.test(trimmed)) return "#";

  const file = decodeURIComponent(trimmed.split("/").pop().split("?")[0]);
  const found = Object.entries(assetUrls).find(([path]) => path.split("/").pop() === file);
  return found ? found[1] : trimmed;
}

function fromModules(modules) {
  return Object.entries(modules).map(([path, source]) => {
    const slug = decodeURIComponent(path.split("/").pop().replace(/\.md$/i, ""));
    const { meta, body } = parseFrontmatter(source);
    return { ...meta, body, slug };
  });
}

const posts = fromModules(blogSources);
const photos = fromModules(photoSources).map((photo) => ({
  ...photo,
  image: resolveAsset(photo.image || ""),
}));

export function loadPosts() {
  return posts;
}

export function loadPhotos() {
  return photos;
}

export async function loadRepos() {
  const response = await fetch(
    "https://api.github.com/users/BugDesigner-Hy/repos?per_page=100&sort=pushed"
  );
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  const repos = await response.json();
  if (!Array.isArray(repos)) throw new Error("GitHub 没有返回仓库列表");

  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)));
}
