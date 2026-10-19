import { Marked } from "marked";

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, "&quot;");
}

export function renderMarkdown(source, resolveUrl = (url) => url) {
  const resolve = (url) => {
    const trimmed = String(url || "").trim();
    if (/^\s*javascript:/i.test(trimmed)) return "#";
    return resolveUrl(trimmed);
  };

  const marked = new Marked();
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const level = Math.min(depth + 1, 6);
        return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
      },
      link({ href, tokens }) {
        const url = resolve(href);
        const external = /^(https?:|mailto:)/i.test(url);
        const extra = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeAttr(url)}"${extra}>${this.parser.parseInline(tokens)}</a>`;
      },
      image({ href, text, tokens }) {
        const alt = text || (tokens ? this.parser.parseInline(tokens) : "");
        return `<img src="${escapeAttr(resolve(href))}" alt="${escapeAttr(alt)}" />`;
      },
      html({ text }) {
        return escapeText(text);
      },
    },
  });

  return marked.parse(String(source).replace(/\r\n/g, "\n"), { async: false });
}
