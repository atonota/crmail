// Enhance existing semantic scroll regions; keep native pointer/keyboard scrolling.
const regions = Array.from(
  document.querySelectorAll<HTMLElement>(".table-scroll"),
);
let keyboard = true;
function update(region: HTMLElement) {
  const overflow = region.scrollWidth > region.clientWidth + 1;
  if (overflow) region.tabIndex = 0;
  else region.removeAttribute("tabindex");
}
const resize = new ResizeObserver(() => regions.forEach(update));
for (const region of regions) {
  update(region);
  resize.observe(region);
  const table = region.querySelector("table");
  if (table) resize.observe(table);
  region.addEventListener("keydown", (event) => {
    if (
      event.target !== region ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    event.preventDefault();
    const rootSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const step =
      Number(getComputedStyle(region).getPropertyValue("--table-scroll-step")) *
      rootSize;
    region.scrollLeft += event.key === "ArrowRight" ? step : -step;
  });
  region.addEventListener("focus", () => {
    region.toggleAttribute("data-pointer-focus", !keyboard);
  });
}
document.addEventListener(
  "pointerdown",
  (event) => {
    keyboard = false;
    if (!(event.target instanceof Element)) return;
    const region = event.target.closest<HTMLElement>(".table-scroll");
    region?.setAttribute("data-pointer-focus", "");
  },
  { capture: true },
);
document.addEventListener(
  "keydown",
  (event) => {
    if (event.metaKey || event.altKey || event.ctrlKey) return;
    keyboard = true;
    regions.forEach((region) => region.removeAttribute("data-pointer-focus"));
  },
  { capture: true },
);
// Astro uses full-page navigation here; release observers/listeners with the document.
