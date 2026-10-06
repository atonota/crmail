import { test, expect } from "@playwright/test";
const route = "/crmail/docs/architecture/backend-doctypes/";
for (const width of [320, 360, 375, 390, 768, 1440]) {
  test(`tables and visible text remain readable at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await expect(
      page.getByRole("button", { name: "Belgelerde ara" }),
    ).toBeEnabled();
    if (width === 768)
      await info.attach("table-768", {
        body: await page.locator(".table-scroll").nth(1).screenshot(),
        contentType: "image/png",
      });
    const evidence = await page.evaluate(() => {
      const rootSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      const tooSmall: { text: string; size: number }[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const el = node.parentElement;
        if (
          !el ||
          !node.textContent?.trim() ||
          !el.getClientRects().length ||
          el.closest("script,style")
        )
          continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < rootSize)
          tooSmall.push({ text: node.textContent.slice(0, 70), size });
      }
      const table =
        document.querySelectorAll<HTMLTableElement>(".prose table")[1];
      const first = table.rows[0].cells[0];
      const styles = getComputedStyle(first);
      return {
        rootSize,
        tooSmall,
        first: {
          width: first.getBoundingClientRect().width,
          wordBreak: styles.wordBreak,
          overflowWrap: styles.overflowWrap,
        },
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    await info.attach("readability", {
      body: JSON.stringify(evidence),
      contentType: "application/json",
    });
    expect(evidence.tooSmall).toEqual([]);
    expect(evidence.first.width).toBeGreaterThanOrEqual(evidence.rootSize * 8);
    expect(evidence.first.wordBreak).toBe("normal");
    expect(evidence.first.overflowWrap).toBe("normal");
    expect(evidence.overflow).toBe(false);
  });
}

test("scroll regions keep keyboard focus but never a pointer frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(route);
  const region = page.locator(".table-scroll").first();
  await region.scrollIntoViewIfNeeded();
  await region.click({ position: { x: 40, y: 40 } });
  expect(await region.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
    "none",
  );
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(region).toBeFocused();
  expect(await region.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
    "solid",
  );
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => region.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await region.click({ position: { x: 40, y: 40 } });
  expect(await region.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
    "none",
  );
  await page.setViewportSize({ width: 2400, height: 900 });
  await expect
    .poll(() => region.evaluate((el) => el.scrollWidth > el.clientWidth))
    .toBe(false);
  await expect(region).not.toHaveAttribute("tabindex", "0");
});

test("root text enlargement preserves rem minimums and contained reflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(route);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px";
  });
  expect(
    await page
      .locator(".prose td")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(20);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
});

test("touch after keyboard focus leaves no table frame", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:45873" + route);
  const region = page.locator(".table-scroll").first();
  await region.scrollIntoViewIfNeeded();
  await region.focus();
  const box = await region.boundingBox();
  if (!box) throw new Error("Missing table scroll region");
  await page.touchscreen.tap(box.x + 40, box.y + 40);
  expect(await region.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
    "none",
  );
  const left = await region.evaluate((el) => el.scrollLeft);
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.wheel(100, 0);
  await expect
    .poll(() => region.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(left);
  await context.close();
});

test("modified arrows retain browser shortcuts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(route);
  const region = page.locator(".table-scroll").first();
  await expect(region).toHaveAttribute("tabindex", "0");
  const prevented = await region.evaluate((el) =>
    ["altKey", "ctrlKey", "metaKey", "shiftKey"].map((modifier) => {
      const event = new KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
        cancelable: true,
        [modifier]: true,
      });
      el.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  );
  expect(prevented).toEqual([false, false, false, false]);
});

test("no-JavaScript tables remain keyboard reachable", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto(route);
    const region = page.locator(".table-scroll").first();
    await region.focus();
    await expect(region).toBeFocused();
    await expect(region).toHaveAttribute("tabindex", "0");
    expect(await region.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );
    expect(
      await region.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe("solid");
  } finally {
    await context.close();
  }
});

test("search and navigation text respect enlarged root minimum", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/crmail/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px";
  });
  await page.locator("summary").first().click();
  await page.getByRole("button", { name: "Belgelerde ara" }).click();
  await page.getByLabel("Kelime veya konu").fill("MJML");
  await expect(page.locator(".search-result").first()).toBeVisible();
  const small = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    const small: string[] = [];
    const minimum = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      if (
        !el ||
        !node.textContent?.trim() ||
        !el.getClientRects().length ||
        el.closest("script,style")
      )
        continue;
      if (parseFloat(getComputedStyle(el).fontSize) < minimum)
        small.push(node.textContent.slice(0, 70));
    }
    return small;
  });
  expect(small).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
});
