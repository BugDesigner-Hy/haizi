const frame = document.createElement("div");
frame.className = "lightbox";
frame.hidden = true;
frame.innerHTML = `
  <div class="lightbox-backdrop"></div>
  <button class="lightbox-close" type="button" aria-label="关闭">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
  </button>
  <figure>
    <img alt="" />
    <figcaption></figcaption>
  </figure>
`;
document.body.append(frame);

const image = frame.querySelector("img");
const caption = frame.querySelector("figcaption");
const openEase = "cubic-bezier(0.22, 1, 0.36, 1)";
const openMs = 560;
const closeMs = 440;

let images = [];
let index = 0;
let token = 0;
let busy = false;

function motionOk() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stopMotion() {
  image.getAnimations().forEach((animation) => animation.cancel());
}

async function paint(source) {
  image.src = source.currentSrc || source.src;
  image.alt = source.alt || "";
  const text = source.dataset.caption || "";
  caption.textContent = text;
  caption.hidden = !text;
  if (!image.complete) {
    try {
      await image.decode();
    } catch {
      /* 解码失败也继续打开 */
    }
  }
}

function flight(origin) {
  if (!origin?.isConnected) return null;
  stopMotion();
  const from = origin.getBoundingClientRect();
  const to = image.getBoundingClientRect();
  if (!from.width || !from.height || !to.width || !to.height) return null;

  const imageAspect = to.width / to.height;
  const thumbAspect = from.width / from.height;
  const cropW = imageAspect > thumbAspect ? thumbAspect / imageAspect : 1;
  const cropH = imageAspect > thumbAspect ? 1 : imageAspect / thumbAspect;
  const scale = from.width / (to.width * cropW);
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const insetX = ((1 - cropW) / 2) * 100;
  const insetY = ((1 - cropH) / 2) * 100;

  return {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    clipPath: `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}%)`,
  };
}

function play(from, to, duration) {
  stopMotion();
  if (!motionOk()) return null;
  const animation = image.animate([from, to], {
    duration,
    easing: openEase,
    fill: "both",
  });
  animation.pause();
  return animation;
}

async function show(next, origin) {
  const current = ++token;
  index = next;
  const source = images[index];
  const fromThumb = Boolean(origin);
  const swapping = frame.classList.contains("is-open") && !fromThumb;
  busy = true;

  if (!frame.classList.contains("is-open")) {
    frame.hidden = false;
    document.body.classList.add("lightbox-open");
  } else if (swapping && motionOk()) {
    stopMotion();
    await image.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease", fill: "forwards" }).finished;
    if (current !== token) return;
  }

  await paint(source);
  if (current !== token) return;

  const start = fromThumb ? flight(origin) : null;
  const animation = start
    ? play(
        start,
        { transform: "translate(0px, 0px) scale(1)", clipPath: "inset(0% 0% 0% 0%)" },
        openMs
      )
    : null;

  frame.classList.add("is-open");
  frame.classList.remove("is-closing");
  if (animation) {
    requestAnimationFrame(() => animation.play());
    animation.onfinish = () => animation.cancel();
  } else if (swapping && motionOk()) {
    image.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: openEase, fill: "forwards" });
  }
  busy = false;
}

function finishClose() {
  frame.hidden = true;
  frame.classList.remove("is-open", "is-closing");
  image.removeAttribute("src");
  document.body.classList.remove("lightbox-open");
  busy = false;
}

function close() {
  if (frame.hidden || frame.classList.contains("is-closing")) return;
  token += 1;
  busy = true;
  frame.classList.remove("is-open");
  frame.classList.add("is-closing");

  const running = image.getAnimations().find((animation) => animation.playState === "running");
  if (running) {
    running.reverse();
    running.onfinish = finishClose;
    return;
  }

  const back = flight(images[index]);
  const animation = back
    ? play(
        { transform: "translate(0px, 0px) scale(1)", clipPath: "inset(0% 0% 0% 0%)" },
        back,
        closeMs
      )
    : null;

  if (!animation) {
    window.setTimeout(finishClose, motionOk() ? 280 : 0);
    return;
  }

  requestAnimationFrame(() => animation.play());
  animation.onfinish = finishClose;
}

frame.addEventListener("click", (event) => {
  if (event.target.closest("figcaption") || busy) return;
  close();
});

document.addEventListener("keydown", (event) => {
  if (frame.hidden || frame.classList.contains("is-closing")) return;
  if (event.key === "Escape") close();
  if (event.key === "ArrowRight" && images.length > 1) show((index + 1) % images.length);
  if (event.key === "ArrowLeft" && images.length > 1) show((index - 1 + images.length) % images.length);
});

export function enableLightbox(root) {
  root.addEventListener("click", (event) => {
    const target = event.target.closest("img");
    if (!target || !root.contains(target) || target.closest("a")) return;
    images = [...root.querySelectorAll("img")].filter((node) => !node.closest("a"));
    const at = images.indexOf(target);
    if (at < 0) return;
    show(at, target);
  });
}
