import { hiddenRepos, projects } from "../content/projects.js";
import { loadPhotos, loadPosts, loadRepos } from "./content.js";
import { byDateDesc, el, formatDate } from "./format.js";

const projectLogos = import.meta.glob("../assets/projects/*.{png,jpg,jpeg,gif,webp,svg}", {
  query: "?url",
  import: "default",
  eager: true,
});

const previewCount = 2;

function brief(text, max = 24) {
  const value = String(text)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/[#>`_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function projectLogo(repoName) {
  const key = String(repoName).toLowerCase();
  const found = Object.entries(projectLogos).find(([path]) => {
    const file = decodeURIComponent(path.split("/").pop()).replace(/\.[^.]+$/, "");
    return file.toLowerCase() === key;
  });
  return found ? found[1] : "";
}

function projectMark(repoName, label) {
  const logo = projectLogo(repoName);
  if (logo) {
    const img = document.createElement("img");
    img.className = "mark";
    img.src = logo;
    img.alt = "";
    return img;
  }
  const letter = Array.from(String(label).trim())[0] || "?";
  return el("span", "mark letter", letter.toLocaleUpperCase());
}

function card(href, name, desc, media) {
  const link = el("a", "card");
  link.href = href;
  if (media) link.append(media);
  const body = el("span", "card-body");
  body.append(el("span", "name", name));
  if (desc) body.append(el("span", "desc", desc));
  link.append(body);
  return link;
}

const projectGrid = document.querySelector("#project-list");

try {
  const repos = await loadRepos();
  if (repos.length === 0) {
    projectGrid.append(el("p", "empty", "还没有公开项目。"));
  }
  for (const repo of repos) {
    if (hiddenRepos.has(repo.name)) continue;
    const custom = projects[repo.name];
    const name = custom?.name || repo.name;
    const href = repo.homepage || repo.html_url;
    const link = card(href, name, custom?.desc || repo.description || "", projectMark(repo.name, name));
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    projectGrid.append(link);
  }
} catch (error) {
  projectGrid.append(el("p", "empty", "项目暂时没有加载出来。"));
  console.error(error);
}

const posts = byDateDesc(await loadPosts());
const blogSection = document.querySelector("#blog-section");
if (posts.length > 0) {
  blogSection.hidden = false;
  const blogGrid = document.querySelector("#blog-preview");
  for (const post of posts.slice(0, previewCount)) {
    const desc = post.summary || [formatDate(post.date), post.location].filter(Boolean).join(" · ");
    blogGrid.append(card(`blog/post.html?slug=${encodeURIComponent(post.slug)}`, post.title || post.slug, desc));
  }
}

const photos = byDateDesc(await loadPhotos());
const photoSection = document.querySelector("#photos-section");
if (photos.length > 0) {
  photoSection.hidden = false;
  const photoGrid = document.querySelector("#photos-preview");
  for (const photo of photos.slice(0, previewCount)) {
    let media = null;
    if (photo.image) {
      media = document.createElement("img");
      media.className = "thumb";
      media.src = photo.image;
      media.alt = "";
    }
    const name = photo.location || formatDate(photo.date) || photo.slug;
    const desc = photo.body ? brief(photo.body) : formatDate(photo.date);
    photoGrid.append(card(`photos/#${encodeURIComponent(photo.slug)}`, name, desc, media));
  }
}
