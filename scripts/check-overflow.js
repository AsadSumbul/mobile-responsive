#!/usr/bin/env node
/**
 * check-overflow.js: scan a URL for horizontal overflow at every device width.
 *
 * Optional helper for the mobile-responsive skill. Deterministic: it reports
 * exactly which elements stick out past the viewport, at each breakpoint.
 *
 * Requires Playwright:
 *   npm i -D playwright && npx playwright install chromium
 *
 * Usage:
 *   node scripts/check-overflow.js http://localhost:3000
 *   node scripts/check-overflow.js https://example.com 320,375,768,1280
 *
 * Exit code 0 = clean, 1 = overflow found (handy in CI).
 */

const { chromium } = require("playwright");

const url = process.argv[2];
if (!url) {
  console.error("Usage: node check-overflow.js <url> [comma,separated,widths]");
  process.exit(2);
}
const widths = (process.argv[3] || "320,360,375,414,768,1024,1280,1440")
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .filter(Boolean);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let anyOverflow = false;

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" });

    const offenders = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const out = [];
      document.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        const overflowBy = Math.round(r.right - docW);
        if (overflowBy > 1) {
          const id = el.id ? `#${el.id}` : "";
          const cls =
            typeof el.className === "string" && el.className
              ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
              : "";
          out.push(`${el.tagName.toLowerCase()}${id}${cls} (+${overflowBy}px)`);
        }
      });
      return [...new Set(out)].slice(0, 15);
    });

    if (offenders.length) {
      anyOverflow = true;
      console.log(`\nFAIL ${width}px overflow:`);
      offenders.forEach((o) => console.log("   " + o));
    } else {
      console.log(`OK ${width}px no overflow`);
    }
  }

  await browser.close();
  console.log(anyOverflow ? "\nOverflow detected." : "\nAll widths clean.");
  process.exit(anyOverflow ? 1 : 0);
})();
