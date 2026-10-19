import { loadPhotos, resolveAsset } from "./content.js";
import { byDateDesc, el, formatPhotoDate } from "./format.js";
import { enableLightbox } from "./lightbox.js";
import { renderMarkdown } from "./markdown.js";

const list = document.querySelector("#photos");
const photos = byDateDesc(await loadPhotos("../"));

if (photos.length === 0) {
  list.append(el("p", "empty", "还没有照片。"));
} else {
  photos.forEach((photo, index) => {
    const shot = el("article", "shot");
    shot.id = photo.slug;

    if (photo.image) {
      const image = document.createElement("img");
      image.src = photo.image;
      image.alt = [photo.location, formatPhotoDate(photo.date)].filter(Boolean).join("，");
      if (index > 0) image.loading = "lazy";
      const meta = [formatPhotoDate(photo.date), photo.location].filter(Boolean);
      const note = photo.body
        ? photo.body.replace(/[*#`>_[\]]/g, "").replace(/\s+/g, " ").trim()
        : "";
      image.dataset.caption = [...meta, note].filter(Boolean).join("\n");
      shot.append(image);
    }

    const meta = [formatPhotoDate(photo.date), photo.location].filter(Boolean);
    if (meta.length) shot.append(el("p", "shot-meta", meta.join(" · ")));

    if (photo.body) {
      const note = el("div", "note");
      note.innerHTML = renderMarkdown(photo.body, resolveAsset);
      shot.append(note);
    }

    list.append(shot);
  });
  enableLightbox(list);
}
