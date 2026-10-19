import { loadPosts, resolveAsset } from "./content.js";
import { backLink, el, formatDate } from "./format.js";
import { enableLightbox } from "./lightbox.js";
import { renderMarkdown } from "./markdown.js";

const root = document.querySelector("#post");
const slug = new URLSearchParams(location.search).get("slug");
const posts = await loadPosts("../");
const post = posts.find((item) => item.slug === slug);

if (!post) {
  document.title = "没有这篇文章 · 海子";
  const missing = el("p", "empty", "没有这篇文章。");
  root.append(missing, backLink("./", "Blog"));
} else {
  document.title = `${post.title || post.slug} · 海子`;

  const back = backLink("./", "Blog");

  const kicker = el("p", "kicker");
  const time = el("time", null, formatDate(post.date || ""));
  if (post.date) time.dateTime = post.date;
  kicker.append(time);
  if (post.location) {
    kicker.append(el("span", "dot", "·"), el("span", "where", post.location));
  }

  const title = el("h1", "page", post.title || post.slug);
  const article = el("article", "prose");
  article.innerHTML = renderMarkdown(post.body, resolveAsset);

  root.append(back, kicker, title, article);
  enableLightbox(article);
}
