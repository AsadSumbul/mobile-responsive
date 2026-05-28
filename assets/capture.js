const { chromium } = require("playwright");
const path = require("path");

const dir = __dirname;
const file = (name) => "file://" + path.join(dir, name).replace(/\\/g, "/");

(async () => {
  const browser = await chromium.launch();

  // Phone width: the before/after comparison.
  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const p1 = await phone.newPage();
  await p1.goto(file("before.html"), { waitUntil: "load" });
  // Viewport-only: shows what actually fits on the phone (the overflow).
  await p1.screenshot({ path: path.join(dir, "before-mobile.png"), fullPage: false });
  const p2 = await phone.newPage();
  await p2.goto(file("after.html"), { waitUntil: "load" });
  await p2.screenshot({ path: path.join(dir, "after-mobile.png"), fullPage: true });

  // Desktop width: the responsive version still looks right.
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  const p3 = await desktop.newPage();
  await p3.goto(file("after.html"), { waitUntil: "load" });
  await p3.screenshot({ path: path.join(dir, "after-desktop.png") });

  await browser.close();
  console.log("captured before-mobile, after-mobile, after-desktop");
})();
