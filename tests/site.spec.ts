import { test, expect } from "@playwright/test";

const widths = [320, 360, 375, 390, 879, 880, 881, 1339, 1340, 1341, 1440];
const heights = widths.map((width) => (width < 400 ? 740 : 900));

for (const [index, width] of widths.entries()) {
  test(`reading and navigation remain fluid at ${width}px`, async ({
    page,
    baseURL,
  }, testInfo) => {
    await page.setViewportSize({ width, height: heights[index] });
    if (!baseURL) throw new Error("Browser test baseURL is required");
    const origin = new URL(baseURL).origin;
    const attempts: string[] = [];
    page.on("request", (request) => attempts.push(request.url()));
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const responses: { url: string; bytes: number; status: number }[] = [];
    const pending: Promise<void>[] = [];
    page.on("response", (response) => {
      if (response.url().startsWith(`${origin}/`))
        pending.push(
          (async () => {
            const bytes = (await response.body().catch(() => Buffer.alloc(0)))
              .byteLength;
            responses.push({
              url: response.url().replace(origin, ""),
              bytes,
              status: response.status(),
            });
          })(),
        );
    });
    await page.goto("/crmail/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".phase-list a")).toHaveCount(8);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    expect(overflow).toBe(false);
    if (width < 400) {
      expect(
        await page
          .locator("main")
          .evaluate((node) => node.getBoundingClientRect().top),
      ).toBeLessThan(300);
    }
    if (width === 320 || width === 1440)
      await testInfo.attach(`home-${width}`, {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    await page.locator(".phase-list a").first().click();
    await expect(page.locator(".prose h1")).toBeVisible();
    if (width === 320)
      await testInfo.attach("document-320", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    await testInfo.attach("document-aria", {
      body: Buffer.from(await page.locator("main").ariaSnapshot()),
      contentType: "text/plain",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
    await Promise.all(pending);
    expect(attempts.length).toBeGreaterThan(0);
    expect(responses.length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    expect(responses.filter((item) => item.status >= 400)).toEqual([]);
    expect(
      responses.some((item) => /grapesjs|mjml-browser/.test(item.url)),
    ).toBe(false);
    expect(attempts.some((url) => /grapesjs|mjml-browser/.test(url))).toBe(
      false,
    );
    expect(attempts.some((url) => url.endsWith("/search.json"))).toBe(false);
    await testInfo.attach("request-attempts", {
      body: Buffer.from(JSON.stringify(attempts, null, 2)),
      contentType: "application/json",
    });
    await testInfo.attach("network", {
      body: Buffer.from(JSON.stringify(responses, null, 2)),
      contentType: "application/json",
    });
  });
}

test("search preserves entered text and keyboard focus through phone rotation", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/crmail/");
  const trigger = page.getByRole("button", { name: "Belgelerde ara" });
  await trigger.focus();
  await trigger.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  const input = page.getByLabel("Kelime veya konu");
  await input.fill("MJML");
  await expect(page.locator(".search-result").first()).toBeVisible();
  await page.setViewportSize({ width: 740, height: 320 });
  await expect(input).toHaveValue("MJML");
  await expect(input).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
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
  await testInfo.attach("search-landscape", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  await input.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const element = document.activeElement!;
    const styles = getComputedStyle(element);
    return {
      outline: styles.outlineStyle,
      width: styles.outlineWidth,
      shadow: styles.boxShadow,
    };
  });
  expect(focus.outline).not.toBe("none");
  expect(parseFloat(focus.width)).toBeGreaterThanOrEqual(2);
  expect(focus.shadow).toBe("none");
});

test("all document links remain usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 740 },
  });
  const page = await context.newPage();
  await page.goto("/crmail/");
  await page.locator("summary").first().click();
  await expect(
    page.getByRole("navigation", { name: "Araştırma belgeleri" }),
  ).toBeVisible();
  await page.locator(".phase-list a").first().click();
  await expect(page.locator(".prose h1")).toBeVisible();
  await context.close();
});

test("reduced motion and touch reading preserve the 320px base experience", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/crmail/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  await expect(page.locator(".phase-list a")).toHaveCount(8);
  await page.locator(".phase-list a").first().tap();
  await expect(page.locator(".prose h1")).toBeVisible();
  await context.close();
});

test("every generated research page opens directly and reflows at 320px", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/crmail/");
  const links = await page
    .locator(".library a")
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).pathname),
    );
  expect(links.length).toBeGreaterThanOrEqual(20);
  for (const href of links) {
    const response = await page.goto(href);
    expect(response?.status(), href).toBe(200);
    await expect(page.locator(".prose h1"), href).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      href,
    ).toBe(false);
  }
});

test("search controls have labelled touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/crmail/");
  await page.getByRole("button", { name: "Belgelerde ara" }).click();
  const close = page.getByRole("button", { name: "Aramayı kapat" });
  await expect(close).toBeVisible();
  // Visibility precedes Mantine's opening scale transition. Measure final geometry.
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
  for (const control of [close, page.getByLabel("Kelime veya konu")]) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});
