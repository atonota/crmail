import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://atonota.github.io",
  base: "/crmail/",
  trailingSlash: "always",
  output: "static",
  integrations: [react()],
});
