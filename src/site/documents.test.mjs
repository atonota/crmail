import test from "node:test";
import assert from "node:assert/strict";
import { documentSlug, rewriteHref, renderDocument } from "./documents.mjs";

test("repeated headings retain distinct accessible anchor destinations", () => {
  const html = renderDocument(
    "# Başlık\n\n## Karar\n\nA\n\n## Karar\n\nB",
    "docs/a.md",
    new Map(),
  );
  assert.ok(html.includes('id="karar"'));
  assert.ok(html.includes('id="karar-2"'));
});

test("docs and reports have disjoint stable routes", () => {
  assert.equal(documentSlug("docs/roadmap/pre-mvp.md"), "roadmap/pre-mvp");
  assert.equal(documentSlug("reports/comparison.md"), "reports/comparison");
});
test("relative markdown links resolve below Pages base", () => {
  const map = new Map([
    ["docs/architecture/frontend.md", "architecture/frontend"],
  ]);
  assert.equal(
    rewriteHref(
      "../architecture/frontend.md#editor",
      "docs/research/gaps.md",
      map,
    ),
    "/crmail/docs/architecture/frontend/#editor",
  );
});
test("javascript urls and raw scripts cannot become executable", () => {
  assert.equal(rewriteHref("javascript:alert(1)", "docs/a.md", new Map()), "#");
  const html = renderDocument(
    "<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)",
    "docs/a.md",
    new Map(),
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
});

test("percent-encoded report links resolve to their published page", () => {
  const map = new Map([
    [
      "reports/Crmail fizibilite ve yol haritası.md",
      "reports/Crmail fizibilite ve yol haritası",
    ],
  ]);
  assert.equal(
    rewriteHref(
      "../../reports/Crmail%20fizibilite%20ve%20yol%20haritası.md",
      "docs/research/feasibility.md",
      map,
    ),
    "/crmail/docs/reports/Crmail fizibilite ve yol haritası/",
  );
});
test("public research evidence links point to the source repository", () => {
  const href = rewriteHref(
    "../research_notes/Crmail%20fizibilite%20ve%20yol%20haritası/frontend-version-evidence.json",
    "reports/report.md",
    new Map(),
  );
  assert.ok(
    href.startsWith(
      "https://github.com/atonota/crmail/blob/main/research_notes/",
    ),
  );
});
