import { test, expect } from "@playwright/test";
for (const width of [320, 1339, 1340, 1341, 1440, 1920, 2136]) {
  test(`tables use available document space at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/crmail/docs/architecture/decisions/");
    await expect(
      page.getByRole("button", { name: "Belgelerde ara" }),
    ).toBeEnabled();
    const evidence = await page.evaluate(() => {
      const layout = document.querySelector<HTMLElement>(".document-layout")!;
      const prose = layout.querySelector<HTMLElement>(".prose")!;
      const wrapper = prose.querySelector<HTMLElement>(".table-scroll")!;
      const styles = getComputedStyle(layout);
      const available =
        styles.display === "grid"
          ? parseFloat(styles.gridTemplateColumns.split(" ")[0])
          : layout.clientWidth;
      return {
        available,
        wrapperWidth: wrapper.clientWidth,
        proseWidth: prose.clientWidth,
        scrollWidth: wrapper.scrollWidth,
        pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    await info.attach("available-space", {
      body: JSON.stringify(evidence),
      contentType: "application/json",
    });
    expect(evidence.wrapperWidth).toBeGreaterThanOrEqual(
      evidence.available - 2,
    );
    expect(evidence.pageOverflow).toBe(false);
    if (width >= 1920)
      expect(evidence.scrollWidth).toBeLessThanOrEqual(
        evidence.wrapperWidth + 1,
      );
    if (width === 2136)
      await info.attach("decision-table-wide", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
  });
}
