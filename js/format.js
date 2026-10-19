export function byDateDesc(items) {
  return [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateParts(value) {
  return /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
}

export function formatDate(value) {
  const match = dateParts(value);
  if (!match) return String(value);
  return `${match[1]}.${match[2]}.${match[3]}`;
}

export function formatMonthDay(value) {
  const match = dateParts(value);
  if (!match) return "";
  return `${months[Number(match[2]) - 1]} ${Number(match[3])}`;
}

export function formatPhotoDate(value) {
  const match = dateParts(value);
  if (!match) return "";
  return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
}

export function readingMinutes(body) {
  const length = String(body || "").replace(/\s+/g, "").length;
  if (!length) return "";
  return `${Math.max(1, Math.round(length / 400))}min`;
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

const backArrow =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function backLink(href, label) {
  const link = el("a", "back");
  link.href = href;
  link.insertAdjacentHTML("beforeend", backArrow);
  if (label) link.append(label);
  return link;
}
