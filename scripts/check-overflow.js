#!/usr/bin/env node
/**
 * check-overflow.js: render a page at a range of widths and report what breaks.
 *
 * Checks, per width:
 *   FAIL  horizontal overflow, naming the outermost elements that cause it
 *   FAIL  missing or broken <meta name="viewport"> (reported once)
 *   WARN  content cut off by `overflow-x: hidden|clip` on <html>/<body>
 *   WARN  tap targets under 24x24 CSS px (phone and tablet widths)
 *   WARN  form fields with font-size under 16px (iOS zooms the page on focus)
 *
 * Requires Playwright (resolved from this script, then from the current
 * directory):
 *   npm i -D playwright && npx playwright install chromium
 *
 * Usage:
 *   node check-overflow.js <url-or-html-file> [options]
 *
 *   --widths 320,375,768      widths to test (default: 320,375,414,768,1024,1280,1440)
 *   --screenshots <dir>       save a full-page PNG per width into <dir>
 *   --height <px>             viewport height (default: 800)
 *   --wait <ms>               extra wait after load, for late-rendering apps
 *
 * Examples:
 *   node check-overflow.js http://localhost:3000/pricing
 *   node check-overflow.js ./dist/index.html --widths 320,768 --screenshots /tmp/shots
 *
 * Exit code: 0 = no failures (warnings allowed), 1 = failures, 2 = could not run.
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const DEFAULT_WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440];
const TOUCH_BELOW = 1024; // widths under this are treated as touch devices
const MAX_LISTED = 10;

function usage(message) {
  if (message) console.error(message + "\n");
  console.error(
    "Usage: node check-overflow.js <url-or-html-file> [--widths 320,375,768] " +
      "[--screenshots <dir>] [--height <px>] [--wait <ms>]"
  );
  process.exit(2);
}

function parseWidths(value) {
  const widths = String(value)
    .split(",")
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!widths.length) usage(`No valid widths in "${value}".`);
  return widths;
}

function parseArgs(argv) {
  const opts = { widths: DEFAULT_WIDTHS, height: 800, wait: 0, screenshots: null, target: null };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = () => {
      if (args[i + 1] === undefined) usage(`${arg} needs a value.`);
      return args[++i];
    };
    if (arg === "-h" || arg === "--help") usage();
    else if (arg === "--widths") opts.widths = parseWidths(next());
    else if (arg === "--screenshots") opts.screenshots = next();
    else if (arg === "--height") opts.height = parseInt(next(), 10) || 800;
    else if (arg === "--wait") opts.wait = parseInt(next(), 10) || 0;
    else if (arg.startsWith("--")) usage(`Unknown option ${arg}.`);
    else if (!opts.target) opts.target = arg;
    // Second positional argument is the original widths syntax; keep it working.
    else opts.widths = parseWidths(arg);
  }
  if (!opts.target) usage();
  return opts;
}

function toUrl(target) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) return target;
  if (fs.existsSync(target)) return pathToFileURL(path.resolve(target)).href;
  if (/^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/|$)/.test(target)) return "http://" + target;
  usage(`"${target}" is neither a URL nor an existing file.`);
}

function loadPlaywright() {
  for (const name of ["playwright", "playwright-core"]) {
    try {
      return require(name);
    } catch (_) {}
    try {
      return require(require.resolve(name, { paths: [process.cwd()] }));
    } catch (_) {}
  }
  console.error(
    "Playwright is not installed, so the page could not be rendered.\n" +
      "Install it with:\n" +
      "  npm i -D playwright && npx playwright install chromium"
  );
  process.exit(2);
}

/** Runs inside the page. Must be self-contained. */
function audit(isTouchWidth) {
  const root = document.documentElement;
  const body = document.body;
  const vw = root.clientWidth;
  const rtl = getComputedStyle(root).direction === "rtl";

  const describe = (el) => {
    let name = el.tagName.toLowerCase();
    if (el.id) name += "#" + el.id;
    const cls = typeof el.className === "string" ? el.className.trim() : "";
    if (cls) name += "." + cls.split(/\s+/).slice(0, 3).join(".");
    const text = (el.textContent || "").trim().replace(/\s+/g, " ");
    return text ? `${name} "${text.slice(0, 30)}${text.length > 30 ? "…" : ""}"` : name;
  };

  const visible = (el, r, cs) =>
    r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";

  // An element inside a scroll container or a clipping box does not widen the
  // page (a table in an overflow-x:auto wrapper is the fix, not the bug).
  // Fixed-position elements never widen it either.
  const contained = (el) => {
    for (let n = el; n && n !== body && n !== root; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === "fixed") return true;
      if (n !== el && cs.overflowX !== "visible") return true;
    }
    return false;
  };

  const past = new Map();
  for (const el of body ? body.querySelectorAll("*") : []) {
    const r = el.getBoundingClientRect();
    const by = Math.round(rtl ? -r.left : r.right - vw);
    if (by <= 1) continue;
    if (!visible(el, r, getComputedStyle(el))) continue;
    if (contained(el)) continue;
    past.set(el, { by, width: Math.round(r.width) });
  }
  // Keep only the outermost offenders: fixing those fixes their descendants.
  const offenders = [];
  for (const [el, info] of past) {
    if (past.has(el.parentElement)) continue;
    offenders.push(`${describe(el)}  (${info.width}px wide, ${info.by}px past the edge)`);
  }

  const scrollWidth = Math.max(root.scrollWidth, body ? body.scrollWidth : 0);
  const clipsX = [root, body].some(
    (n) => n && ["hidden", "clip"].includes(getComputedStyle(n).overflowX)
  );

  const smallTargets = [];
  const smallFields = [];
  if (isTouchWidth) {
    const selector =
      'a[href], button, select, textarea, summary, [role="button"], [role="link"], ' +
      '[role="tab"], [role="menuitem"], input:not([type="hidden"])';
    for (const el of document.querySelectorAll(selector)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!visible(el, r, cs)) continue;
      const type = (el.getAttribute("type") || "").toLowerCase();
      const isField =
        el.matches("select, textarea") ||
        (el.matches("input") &&
          !["checkbox", "radio", "range", "button", "submit", "reset", "file", "color", "image"].includes(type));
      if (isField && parseFloat(cs.fontSize) < 16) {
        smallFields.push(`${describe(el)}  (font-size ${parseFloat(cs.fontSize)}px)`);
      }
      // Links inside running text are exempt (WCAG 2.5.8), and checkboxes and
      // radios usually get their real target size from a wrapping label.
      if (el.matches("a") && cs.display === "inline") continue;
      if (type === "checkbox" || type === "radio") continue;
      if (r.width < 24 || r.height < 24) {
        smallTargets.push(`${describe(el)}  (${Math.round(r.width)}x${Math.round(r.height)}px)`);
      }
    }
  }

  const meta = document.querySelector('meta[name="viewport"]');
  return {
    vw,
    overflowPx: scrollWidth - vw,
    clipsX,
    offenders: [...new Set(offenders)],
    smallTargets: [...new Set(smallTargets)],
    smallFields: [...new Set(smallFields)],
    viewportMeta: meta ? meta.getAttribute("content") || "" : null,
  };
}

function printList(items) {
  items.slice(0, MAX_LISTED).forEach((item) => console.log("     " + item));
  if (items.length > MAX_LISTED) console.log(`     …and ${items.length - MAX_LISTED} more`);
}

(async () => {
  const opts = parseArgs(process.argv);
  const url = toUrl(opts.target);
  const { chromium } = loadPlaywright();

  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    console.error("Could not launch Chromium: " + err.message.split("\n")[0]);
    console.error("Try: npx playwright install chromium");
    process.exit(2);
  }

  if (opts.screenshots) fs.mkdirSync(opts.screenshots, { recursive: true });

  let failures = 0;
  let warnings = 0;
  let viewportMeta;

  console.log(`Checking ${url}`);

  for (const width of opts.widths) {
    const isTouchWidth = width < TOUCH_BELOW;
    const context = await browser.newContext({
      viewport: { width, height: opts.height },
      hasTouch: isTouchWidth,
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      // Dev servers with polling never go idle, so this is best effort.
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      if (opts.wait) await page.waitForTimeout(opts.wait);
    } catch (err) {
      console.error(`\nCould not load ${url}: ${err.message.split("\n")[0]}`);
      await browser.close();
      process.exit(2);
    }

    const result = await page.evaluate(audit, isTouchWidth);
    viewportMeta = result.viewportMeta;
    const label = `${width}px`.padEnd(7);

    if (result.overflowPx > 1 && !result.clipsX) {
      failures++;
      console.log(`\nFAIL ${label} page scrolls sideways by ${result.overflowPx}px. Caused by:`);
      printList(result.offenders.length ? result.offenders : ["(no single element found; check margins and transforms)"]);
    } else if (result.clipsX && result.offenders.length) {
      warnings++;
      console.log(`\nWARN ${label} overflow-x on html/body hides the scrollbar, but this content is cut off:`);
      printList(result.offenders);
    } else {
      console.log(`OK   ${label} no horizontal overflow`);
    }

    if (result.smallTargets.length) {
      warnings++;
      console.log(`WARN ${label} tap targets under 24x24px:`);
      printList(result.smallTargets);
    }
    if (result.smallFields.length) {
      warnings++;
      console.log(`WARN ${label} fields under 16px font-size (iOS zooms in on focus):`);
      printList(result.smallFields);
    }

    if (opts.screenshots) {
      const file = path.join(opts.screenshots, `${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`     screenshot: ${file}`);
    }
    await context.close();
  }

  await browser.close();

  if (viewportMeta === null) {
    failures++;
    console.log(
      '\nFAIL no <meta name="viewport">. Phones will render this page at ~980px and zoom out.\n' +
        '     Add: <meta name="viewport" content="width=device-width, initial-scale=1">'
    );
  } else if (!/width\s*=\s*device-width/i.test(viewportMeta)) {
    failures++;
    console.log(`\nFAIL viewport meta lacks width=device-width (found: "${viewportMeta}").`);
  } else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0*)?(\D|$)/i.test(viewportMeta)) {
    warnings++;
    console.log(`\nWARN viewport meta blocks pinch-zoom (found: "${viewportMeta}"). Remove the zoom limits.`);
  }

  console.log(
    `\n${failures ? "Failed" : "Passed"}: ${failures} failure(s), ${warnings} warning(s) ` +
      `across ${opts.widths.length} width(s).`
  );
  process.exit(failures ? 1 : 0);
})();
