---
name: mobile-responsive
description: >-
  This skill should be used whenever the agent creates, edits, reviews, or
  debugs any web UI such as pages, components, layouts, sections, forms, navs,
  cards, tables, or modals. It guarantees the output is mobile-friendly and
  responsive across the full range of devices (small phones at 320px through
  large desktops), prevents horizontal overflow, and makes the result look
  intentional and beautiful rather than merely "not broken". It also enforces
  visual consistency: new UI must match the spacing, type, breakpoints, and
  component patterns already in the project, and remain coherent with components
  added later. Trigger on phrases like "make this responsive", "mobile
  friendly", "works on phones", "fix the layout on mobile", "it's overflowing",
  "looks broken on small screens", or any request to build/style web UI where no
  responsive behavior was specified. Use it proactively whenever generating new
  web markup.
metadata:
  author: AsadSumbul
  version: "1.0.0"
---

# Mobile Responsive

Every piece of web UI this skill touches must (1) work flawlessly from 320px to
large desktop, (2) never overflow horizontally, (3) look deliberately designed,
and (4) stay visually consistent with the rest of the project, both past and
future.

Work **mobile-first**: the base, unprefixed styles target the smallest screen,
then you add complexity upward. Never start from desktop and shrink down.

## Step 0: Learn the project's conventions first (do not skip)

Before writing or changing any UI, read what already exists so new work blends
in instead of clashing. Beautiful and consistent beats clever and isolated.

1. **Find sibling components** in the same directory/feature. Read two or three
   of them.
2. **Extract the conventions** they already follow:
   - Styling system (Tailwind, CSS Modules, styled-components, plain CSS, Bootstrap, etc.). **Match it, and never introduce a second one.**
   - Spacing scale actually in use (e.g. only `4 / 8 / 16 / 24 / 32`, or Tailwind's `gap-2 gap-4 gap-6`). Reuse the same steps.
   - Type scale (the specific sizes/weights used for headings vs body).
   - Breakpoints already chosen (`sm md lg`, or custom values). Use the same set, and don't invent new breakpoints.
   - Color/spacing **design tokens** or theme variables. Use the tokens, never hard-coded hex/px that duplicates a token.
   - Container/max-width and horizontal-padding pattern used by surrounding sections.
   - Component structure conventions (how props/variants/slots are named).
3. **Match them.** A new card should feel like it shipped in the same release as
   the old cards. If the project has no convention yet, establish a clean one
   (see `references/design-consistency.md`) and apply it consistently so future
   components have a pattern to follow.

If `tailwind.config`, a theme file, or a design-tokens file exists, read it.
That is the source of truth for spacing, breakpoints, and colors.

## Step 1: Build and fix, mobile-first

1. Write base styles for the smallest screen with **no** breakpoint prefix and
   **no** media query.
2. Layer larger-screen behavior on top using min-width breakpoints only
   (Tailwind `sm: md: lg:` are min-width; in CSS use `@media (min-width: ...)`).
3. Use the conventions from Step 0 for every spacing, size, and breakpoint value.

## Step 2: Guarantee no overflow (hard requirement)

Horizontal scroll on mobile is a defect, never acceptable. Prevent it at the
source. Most common causes, with fixes:

- **Fixed widths** become `w-full max-w-[Npx]` (Tailwind) or `width:100%; max-width:Npx`.
- **Flex children that won't shrink** get `min-w-0` (and `truncate` on text that should ellipsis).
- **Wide media:** all `img/video/iframe/svg` get `max-w-full h-auto`.
- **Long unbroken strings/URLs** get `break-words` / `overflow-wrap: anywhere`.
- **Fixed-width tables:** wrap in `overflow-x-auto` so the table scrolls, not the page.
- **Negative margins / `100vw`:** `100vw` includes the scrollbar and overflows, so prefer `w-full`.
- **Absolute/translated elements** poking past the edge: clip with `overflow-hidden` on a sized parent.

After building, mentally (or with `scripts/check-overflow.js`) confirm zero
horizontal scroll at every width in the device matrix below. Full deep-dive in
`references/overflow-prevention.md`.

## Step 3: Make it beautiful, not just functional

Responsive doesn't mean squished. Aim for layouts that look composed at every
size.

- **Reflow, don't just shrink.** Multi-column grids collapse to fewer columns or
  a single stack on mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), rather
  than keeping cramped columns.
- **Fluid type.** Headings scale with `clamp()` or responsive utilities so they
  don't dwarf small screens (`text-2xl md:text-4xl`).
- **Protect whitespace.** Add responsive horizontal padding (`px-4 md:px-8`) so
  content never kisses the edge; scale gaps down on mobile (`gap-4 md:gap-8`).
- **Touch targets of about 44px or larger** on interactive elements (`min-h-11`, real padding).
- **Honor reading width.** Cap body text line length (`max-w-prose` / ~65ch).
- **Hide vs. transform.** Collapse desktop navs into a toggle below `md`; don't
  just let them wrap into a mess.
- **Order matters.** Use `order-*` / `flex-col-reverse` so the most important
  thing (usually the headline or primary CTA) comes first on mobile.

## Step 4: Verify across the full device range

A layout isn't "mobile responsive" because it survives one phone width. Walk it
across the matrix:

| Width  | Represents                         |
|--------|------------------------------------|
| 320px  | Smallest phones, the stress test   |
| 375px  | Standard phone                     |
| 414px  | Large phone                        |
| 768px  | Tablet portrait                    |
| 1024px | Tablet landscape / small laptop    |
| 1280px | Desktop                            |
| 1440px+| Large desktop                      |

At each one: no horizontal scroll, no clipped/overlapping content, readable
type, tappable controls, intact alignment with neighboring sections. Then state
in one or two sentences what you changed and why. Do not touch unrelated code.

## Rules

- **Mobile-first, min-width only.** Avoid `max-width` queries except for genuine
  desktop-only behavior.
- **Match the existing system.** Never add a new CSS framework or a parallel
  spacing/type scale. Reuse tokens and conventions (Step 0).
- **Relative units.** Prefer `rem / % / fr / vw / minmax / clamp` over fixed
  `px`; never set fixed pixel **heights** on containers with variable content.
- **No overflow, ever.** Treat horizontal scroll as a bug to be fixed at the source.
- **Beautiful by default.** If a quick fix is ugly, do the slightly larger fix
  that looks intentional.
- **Stay in scope.** Don't restyle components the user didn't ask about, but do
  make sure your new component is consistent with them.

## Reference files (read on demand)

- `references/breakpoints.md`: breakpoint values, device matrix, container queries, fluid type.
- `references/overflow-prevention.md`: every overflow cause, fix, and debugging technique.
- `references/design-consistency.md`: extracting and matching a project's design language; building a token system when none exists.
- `references/frameworks.md`: stack-specific syntax (Tailwind, plain CSS, CSS Modules, styled-components, Bootstrap, Flutter web).

## Quick example

**Before** (fixed width, desktop-only, will overflow on phones):

```jsx
<div className="flex w-[960px] gap-8 p-10">
  <img src="/hero.png" width="600" />
  <div>
    <h1 className="text-5xl">Welcome</h1>
    <p>Some long description...</p>
  </div>
</div>
```

**After** (fluid, stacks on mobile, no overflow, scales nicely, reuses the
project's spacing steps):

```jsx
<div className="flex flex-col md:flex-row w-full max-w-[960px] gap-4 md:gap-8 px-4 py-6 md:p-10">
  <img src="/hero.png" className="w-full md:max-w-[600px] h-auto rounded-lg" />
  <div className="min-w-0">
    <h1 className="text-3xl md:text-5xl">Welcome</h1>
    <p className="max-w-prose break-words">Some long description...</p>
  </div>
</div>
```
