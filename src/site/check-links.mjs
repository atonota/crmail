import fs from "node:fs";
import path from "node:path";
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".html")) files.push(p);
  }
}
walk("dist");
const broken = [];
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith("/crmail/")) continue;
    const target = href.split("#")[0].split("?")[0].slice("/crmail/".length);
    const disk = path.join(
      "dist",
      target.endsWith("/") ? `${target}index.html` : target,
    );
    if (!fs.existsSync(disk)) broken.push(`${file}: ${href}`);
  }
}
if (broken.length) {
  console.error(broken.join("\n"));
  process.exitCode = 1;
} else console.log(`${files.length} HTML route: internal links pass`);
