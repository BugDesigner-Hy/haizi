(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const native = "CSSViewTransitionRule" in window;
  if (reduce || native) return;

  const key = "haizi-page";
  const root = document.documentElement;

  if (sessionStorage.getItem(key) === "1") {
    sessionStorage.removeItem(key);
    root.classList.add("is-entering");
    addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(() => root.classList.add("is-entered"));
    });
  }

  addEventListener(
    "click",
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest?.("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      event.preventDefault();
      sessionStorage.setItem(key, "1");
      root.classList.add("is-leaving");

      let left = false;
      const go = () => {
        if (left) return;
        left = true;
        location.href = url.href;
      };
      root.addEventListener("transitionend", (transition) => {
        if (transition.target === root && transition.propertyName === "opacity") go();
      });
      setTimeout(go, 420);
    },
    true
  );
})();
