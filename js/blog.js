import { loadPosts } from "./content.js";
import { byDateDesc, el, formatMonthDay, readingMinutes } from "./format.js";

const list = document.querySelector("#posts");
const posts = byDateDesc(await loadPosts("../"));

if (posts.length === 0) {
  list.append(el("p", "empty", "还没有文章。"));
} else {
  let year = "";
  let group = null;

  for (const post of posts) {
    const nextYear = /^\d{4}/.test(post.date || "") ? post.date.slice(0, 4) : "";
    if (!group || nextYear !== year) {
      year = nextYear;
      group = el("section", "year-group");
      if (year) {
        const mark = el("div", "year-mark", year);
        mark.setAttribute("aria-hidden", "true");
        group.append(mark);
      }
      list.append(group);
    }

    const link = el("a", "post-row");
    link.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
    link.append(el("span", "post-title", post.title || post.slug));

    const meta = [formatMonthDay(post.date), post.location, readingMinutes(post.body)].filter(Boolean);
    if (meta.length) link.append(el("span", "post-meta", meta.join(" · ")));
    group.append(link);
  }
}
