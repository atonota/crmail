import fs from "node:fs";
import path from "node:path";
import { marked, Renderer } from "marked";

const base = "/crmail/";
function headingSlugger() {
  const counts = new Map();
  return (text) => {
    const baseId = text
      .toLocaleLowerCase("tr")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-");
    const count = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, count);
    return count === 1 ? baseId : `${baseId}-${count}`;
  };
}
export function documentHeadings(markdown) {
  const slug = headingSlugger();
  return marked
    .lexer(markdown)
    .filter((token) => token.type === "heading")
    .map((token) => ({
      text: token.text,
      depth: token.depth,
      id: slug(token.text),
    }));
}
export function documentSlug(file) {
  return file.replace(/^docs\//, "").replace(/\.md$/, "");
}
export function rewriteHref(href, current, slugs) {
  if (!href) return "#";
  if (/^(javascript|data|vbscript):/i.test(href)) return "#";
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  const [file, anchor] = href.split("#");
  let decodedFile;
  try {
    decodedFile = decodeURIComponent(file);
  } catch {
    return href;
  }
  const key = path.posix.normalize(
    path.posix.join(path.posix.dirname(current), decodedFile),
  );
  const slug = slugs.get(key);
  if (!slug && key.startsWith("research_notes/") && fs.existsSync(key)) {
    const sourcePath = key.split("/").map(encodeURIComponent).join("/");
    return `https://github.com/atonota/crmail/blob/main/${sourcePath}`;
  }
  return slug ? `${base}docs/${slug}/${anchor ? `#${anchor}` : ""}` : href;
}
export function renderDocument(markdown, current, slugs) {
  const escape = (text) =>
    text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const renderer = new Renderer();
  const headingId = headingSlugger();
  Object.assign(renderer, {
    html({ text }) {
      return escape(text);
    },
    link({ href, tokens }) {
      const target = rewriteHref(href, current, slugs);
      return `<a href="${escape(target)}">${this.parser.parseInline(tokens)}</a>`;
    },
    heading({ text, depth, tokens }) {
      const id = headingId(text);
      return `<h${depth} id="${escape(id)}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
    table(token) {
      return `<section class="table-scroll" aria-label="Karşılaştırma tablosu" tabindex="0">${Renderer.prototype.table.call(this, token)}</section>`;
    },
  });
  return marked.parse(markdown, { gfm: true, renderer });
}
const labels = {
  research: "Araştırma",
  architecture: "Mimari",
  phases: "Geliştirme fazları",
  roadmap: "Yol haritası",
  ux: "Deneyim",
  qa: "Doğrulama",
  claude: "Claude",
  reports: "Araştırma raporu",
  decisions: "Kararlar",
};
export function loadDocuments() {
  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && file.endsWith(".md")) files.push(file);
    }
  };
  walk("docs");
  walk("reports");
  const slugs = new Map(files.map((file) => [file, documentSlug(file)]));
  return files
    .map((file) => {
      const content = fs.readFileSync(file, "utf8");
      const title =
        content.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(file, ".md");
      const category = file.startsWith("reports/")
        ? "reports"
        : file.split("/")[1].replace(/\.md$/, "");
      return {
        file,
        slug: documentSlug(file),
        title,
        group: labels[category] ?? "Belgeler",
        category,
        content,
        html: renderDocument(content, file, slugs),
        href: `${base}docs/${documentSlug(file)}/`,
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file, "tr"));
}
