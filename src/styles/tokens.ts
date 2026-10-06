export const brandPalette = [
  "#eaf4ff",
  "#d3e9ff",
  "#add5ff",
  "#80bdff",
  "#4fa3ff",
  "#1688ff",
  "#0071e3",
  "#005cb8",
  "#064b91",
  "#082e64",
] as const;
export const colors = {
  surface: "#f4f7fb",
  "surface-raised": "#ffffff",
  "surface-accent": brandPalette[0],
  text: "#10233c",
  "text-secondary": "#51657f",
  accent: brandPalette[7],
  "accent-hover": brandPalette[8],
  "accent-muted": brandPalette[1],
  focus: brandPalette[7],
  rule: "#dae4ef",
};
export const tokenCss = `@layer tokens { :root { ${Object.entries(colors)
  .map(([name, value]) => `--${name}:${value};`)
  .join("")} } }`;
