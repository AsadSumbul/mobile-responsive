---
name: mobile-responsive
description: >-
  Makes web UI work on every screen size, from 320px phones to wide desktops,
  with no horizontal overflow and a look that matches the project's existing
  design system. Use when building or restyling any page, component, or layout
  (HTML, CSS, Tailwind, React, Vue, Svelte, and similar), even if the user never
  mentions mobile; when asked to make something responsive or mobile friendly;
  when a layout overflows, scrolls sideways, gets cut off, or looks broken on a
  phone or tablet; and when reviewing or auditing UI for responsiveness.
  Includes a Playwright script that renders a page at each width and names the
  exact elements that overflow.
license: MIT
metadata:
  author: AsadSumbul
  version: "2.0.0"
---

# Mobile Responsive

Web UI you build or change should hold up at every width from 320px to a wide
desktop: nothing scrolls sideways, nothing is cut off or overlapping, text is
readable, controls are tappable, and the result looks like it belongs to the
project it sits in.

Most responsive bugs come from code that was written at one width and never
looked at on another. So this skill has two halves: write the layout so it
adapts by construction, then render it at several widths and look.

## Fit the effort to the task

- **Building or restyling UI:** follow the whole workflow below.
- **Fixing a reported problem** ("it overflows on my phone"): reproduce it first
  (step 5), find the element that causes it, fix that element, and re-check.
  Skip the convention survey beyond what the fix touches.
- **Reviewing or auditing:** run the checker, read the code, and report what you
  found, ordered by how badly it breaks the page. Change nothing unless asked.
- **A small edit that does not affect layout** (copy, a color, a handler): make
  the edit and leave the rest alone.

Keep changes inside what was asked. If you notice responsive problems in code
you were not asked to touch, mention them instead of fixing them.

## 1. Read the project before writing

New UI should look like it shipped with the UI around it. Before writing, read
two or three neighboring components and the theme source, and note:

- **The styling system** (Tailwind, CSS Modules, styled-components, plain CSS,
  Bootstrap, a component library). Use it. Do not introduce a second one.
- **The breakpoints.** Use the project's set so that everything on a page
  reflows at the same widths. Look in `tailwind.config.*`, or for Tailwind v4 in
  the `@theme` block of the main CSS file, or in a theme or tokens file.
- **Spacing, type sizes, radii, shadows, and colors** actually in use. Take
  values from the existing scale and tokens instead of writing new literals.
- **The page container:** the max-width and side padding that sections share.
- **Shared primitives** (`Button`, `Card`, `Container`, a nav or sheet
  component). Reuse them instead of rebuilding them.

If the project has no conventions yet, set up a small token set and use it
consistently. `references/design-consistency.md` covers both cases.

## 2. Build mobile-first

Write the unprefixed, query-free styles for the narrowest screen, then add
layout for wider screens with `min-width` queries (Tailwind's `sm:` `md:` `lg:`
are already min-width). The narrow layout is usually the simple one (a single
column in source order), so wider layouts become additions rather than
overrides, and a width nobody tested falls back to something that works.

Prefer layout that adapts without any breakpoint:

- `flex-wrap`, or `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`
- `width: 100%` with a `max-width`, instead of a fixed width
- `clamp()` for headings and section spacing that should scale with the screen
- container queries when a component is used in slots of different widths

Check that the page has
`<meta name="viewport" content="width=device-width, initial-scale=1">`. Without
it a phone lays the page out at about 980px and zooms out, and no CSS will fix
that. Do not disable zoom (`user-scalable=no`, `maximum-scale=1`).

## 3. Prevent horizontal overflow

A page that scrolls sideways on a phone is broken. Fix the element that causes
it. `overflow-x: hidden` on `body` only hides the scrollbar: the content is
still cut off, and it disables `position: sticky` for everything inside.

| Cause | Fix |
|---|---|
| Fixed width (`width: 600px`, `w-[600px]`) | `width: 100%; max-width: 600px` / `w-full max-w-[600px]` |
| Flex or grid child that will not shrink below its content | `min-width: 0` / `min-w-0` on the child; `minmax(0, 1fr)` for grid tracks |
| Row of items that does not wrap | `flex-wrap: wrap`, or stack with `flex-col` and switch to a row at a breakpoint |
| Images, video, iframes, SVG | `max-width: 100%; height: auto` / `max-w-full h-auto` |
| Long URLs, emails, IDs | `overflow-wrap: anywhere` / `break-words` (plus `min-w-0` inside flex) |
| Tables and code blocks | Put them in a wrapper with `overflow-x: auto` so the wrapper scrolls and the page does not |
| `width: 100vw` | `width: 100%` (`100vw` includes the scrollbar's width) |
| Negative margins, absolute or transformed decorations | Clip on the nearest sized ancestor with `overflow: hidden` or `clip` |
| `minmax(16rem, 1fr)` in a container narrower than 16rem | `minmax(min(100%, 16rem), 1fr)` |

`references/overflow-prevention.md` has the full list and how to hunt down a
culprit by hand.

## 4. Make each width look intended

A layout that merely fits is not finished. At each size it should look like
someone designed it for that size.

- **Reflow instead of shrinking.** Columns collapse to fewer columns or a single
  stack (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). Three 100px columns on a
  phone is not a layout.
- **Scale type and spacing.** Large headings and section padding come down on
  small screens (`text-3xl md:text-5xl`, `py-12 md:py-24`). Body text stays at
  16px or more.
- **Keep side padding.** Content needs at least 16px between it and the screen
  edge, and the same gutter as the sections around it.
- **Cap line length** at roughly 65 characters (`max-w-prose`, `max-width: 65ch`)
  so text does not sprawl on wide screens.
- **Make controls tappable.** Aim for 44x44px on buttons, nav items, and icon
  buttons, and never go below 24x24. Leave space between adjacent targets.
- **Use 16px or larger text in form fields.** iOS Safari zooms the page when a
  smaller field is focused.
- **Do not hide anything behind hover.** Touch screens have none. Tooltips,
  dropdowns, and row actions need a tap or focus path.
- **Put the important thing first on a phone.** When a row stacks, check that the
  order still makes sense, and reorder if the image lands above the headline.
- **Use `dvh`/`svh` in place of `100vh`** for full-height sections. `100vh` is
  taller than the visible area when mobile browser chrome is showing.
- **Respect notches** for fixed bars with `env(safe-area-inset-*)`.

Navigation, data tables, forms, modals, and images each have well-worn mobile
patterns. Read `references/components.md` when you build one.

## 5. Render it and look

Do not report a layout as responsive because the code looks right. Render it.

```bash
node <this-skill-dir>/scripts/check-overflow.js http://localhost:3000/page --screenshots <tmp-dir>
```

The argument is a URL or a path to an HTML file. The script loads the page at
320, 375, 414, 768, 1024, 1280, and 1440px and reports:

- `FAIL` for horizontal overflow, with the outermost elements causing it, and
  for a missing or wrong viewport meta tag
- `WARN` for content cut off by `overflow-x: hidden` on `body`, tap targets under
  24px, and form fields under 16px

Then open the screenshots, at least the 320px, 768px, and one desktop shot. The
script cannot see that a heading wraps to five lines, that cards have uneven
heights, or that a section looks empty on a tablet. You can.

Bugs also hide just below breakpoints. If the project switches layout at 768px,
add 767 with `--widths 320,767,768,1024`. Use `--wait 1000` for pages that render
late. Warnings do not all need fixing: judge each one, and leave alone those in
code you were not asked to change.

The script needs Playwright. If it is not installed, use any other browser tool
you have (a browser MCP server, the project's own Playwright or Cypress setup)
to load the page at 320px and a desktop width. Ask before adding a dependency
to the user's project. If you cannot render the page at all, walk the code at
320px by reasoning through it, and say plainly in your report that the result
was not rendered.

For pages behind a login or with state that only appears after interaction (an
open menu, a filled table, an error state), the script sees only the initial
load. Check those states another way or tell the user they were not covered.

## 6. Report

Finish with a short account: what was wrong or what you built, what you changed
and where, and how it was verified (which widths, script or by eye, or not
rendered). Include anything you noticed but left alone.

## Example

A hero written at one width:

```jsx
<div className="flex w-[960px] gap-8 p-10">
  <img src="/hero.png" width="600" alt="Dashboard" />
  <div>
    <h1 className="text-5xl">Welcome back, {user.email}</h1>
    <p>Some long description...</p>
  </div>
</div>
```

The same hero, mobile-first:

```jsx
<div className="mx-auto flex w-full max-w-[960px] flex-col gap-4 px-4 py-6 md:flex-row md:gap-8 md:p-10">
  <img src="/hero.png" alt="Dashboard" className="h-auto w-full rounded-lg md:w-1/2" />
  <div className="min-w-0">
    <h1 className="text-3xl break-words md:text-5xl">Welcome back, {user.email}</h1>
    <p className="max-w-prose">Some long description...</p>
  </div>
</div>
```

What changed: the fixed width became a cap, the row stacks until `md`, the image
is fluid, the text column is allowed to shrink (`min-w-0`) and a long email can
wrap, and padding, gap, and heading size step down on small screens. The
spacing steps and the `md` breakpoint would come from the project, not from
this example.

## Reference files

Read these when the task calls for them:

- `references/components.md`: mobile patterns for navigation, tables, forms,
  modals, images, sticky bars, and hero sections.
- `references/overflow-prevention.md`: every overflow cause with its fix, and
  manual debugging.
- `references/breakpoints.md`: breakpoint values, test widths, fluid type with
  `clamp()`, container queries, viewport units.
- `references/design-consistency.md`: reading a project's design language, and
  setting one up when there is none.
- `references/frameworks.md`: syntax for Tailwind v3 and v4, plain CSS, CSS
  Modules, styled-components and Emotion, Bootstrap, and Flutter.

This skill covers browser-rendered UI. HTML email follows different rules
(tables, inline styles, almost no media query support in some clients), so do
not apply this workflow there.
