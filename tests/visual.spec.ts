import { test, expect } from "@playwright/test";

// Greenfield references are reviewed separately; never bulk-update existing images.
for (const width of [320, 1440]) {
  test(`visual home ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 900 });
    await page.goto("/crmail/");
    await expect(
      page.getByRole("button", { name: "Belgelerde ara" }),
    ).toBeEnabled();
    await expect(page).toHaveScreenshot(`home-${width}.png`, {
      maxDiffPixels: 0,
    });
  });
}

test("visual document 320", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/crmail/");
  await page.locator(".phase-list a").first().click();
  await expect(page.locator(".prose h1")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Belgelerde ara" }),
  ).toBeEnabled();
  await expect(page).toHaveScreenshot("document-320.png", { maxDiffPixels: 0 });
});

test("visual search landscape", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/crmail/");
  await page.getByRole("button", { name: "Belgelerde ara" }).click();
  await page.getByLabel("Kelime veya konu").fill("MJML");
  await expect(page.locator(".search-result").first()).toBeVisible();
  await page.setViewportSize({ width: 740, height: 320 });
  await expect
    .poll(() =>
      page.locator(".search-modal").evaluate((element) => {
        const style = getComputedStyle(element);
        return (
          style.opacity === "1" &&
          new DOMMatrixReadOnly(style.transform).isIdentity
        );
      }),
    )
    .toBe(true);
  await expect(page).toHaveScreenshot("search-landscape.png", {
    maxDiffPixels: 0,
  });
});

for (const width of [320, 768]) {
  test(`visual model table ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/crmail/docs/architecture/backend-doctypes/");
    await expect(
      page.getByRole("button", { name: "Belgelerde ara" }),
    ).toBeEnabled();
    await expect(page.locator(".table-scroll").nth(1)).toHaveScreenshot(
      `model-table-${width}.png`,
      { maxDiffPixels: 0 },
    );
  });
}
