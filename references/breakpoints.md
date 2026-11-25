# Breakpoints, test widths, and fluid sizing

Read this for breakpoint values, the widths worth testing, fluid type,
container queries, and viewport units.

## Use the project's breakpoints

A project's breakpoints are part of its design system. Find them before writing
a media query, and use that set only, so everything on a page reflows together:

- Tailwind v3: `theme.screens` in `tailwind.config.*`
- Tailwind v4: `--breakpoint-*` variables in the `@theme` block of the main CSS
- Sass: a `$breakpoints` map or mixins such as `@include md { ... }`
- CSS-in-JS: `theme.breakpoints`
- Plain CSS: search for `@media` and see which values repeat

If you find `max-width` queries used throughout (a desktop-first codebase),
follow that convention inside existing files. Consistency within a file is
worth more than converting one component to mobile-first.

## Common defaults (all min-width)

| Name | Tailwind | Bootstrap 5 | Typical layout change |
|------|----------|-------------|-----------------------|
| base | 0        | 0           | Phone: single column  |
| sm   | 640px    | 576px       | Large phone: two-up grids, inline buttons |
| md   | 768px    | 768px       | Tablet: side-by-side sections, full nav |
| lg   | 1024px   | 992px       | Laptop: sidebars, three-column grids |
| xl   | 1280px   | 1200px      | Desktop: wider containers |
| 2xl  | 1536px   | 1400px (xxl)| Large desktop |

`md:flex` means "flex at 768px and wider". Write the unprefixed class for
phones and override upward.

## Mobile-first in plain CSS

```css
.card { padding: 1rem; }                 /* base: phones */

@media (min-width: 48rem) {              /* 768px */
  .card { padding: 2rem; }
}
```

`rem` breakpoints respect the user's browser font size. Use them in a new
project; in an existing one, match the unit already in use.

`max-width` and range queries are fine when a rule applies only to small
screens and would otherwise need undoing: `@media (width < 48rem) { ... }` or
Tailwind's `max-md:`.

## Widths to test

| Width  | Stands for                         | What tends to break            |
|--------|------------------------------------|--------------------------------|
| 320px  | Smallest phones, zoomed text, split view | Everything. Test it first. |
| 375px  | Typical phone (360 to 393)         | Baseline phone layout          |
| 414px  | Large phone (412 to 430)           | Awkward gaps before `sm`       |
| 768px  | Tablet portrait                    | The single to multi-column switch |
| 1024px | Tablet landscape, small laptop     | Sidebars and full nav squeezing in |
| 1280px | Laptop and desktop                 | The designed layout            |
| 1440px+| Large desktop                      | Missing max-width, stretched lines |

Also test **1px below each breakpoint** the layout uses (767 for a 768
breakpoint). That is where the smaller layout is at its widest and the larger
one has not yet taken over, and it is where cramped or oversized states hide.

Short screens matter too: a phone in landscape is roughly 667x375. Fixed headers
plus fixed footers can consume most of it, and full-height sections become
cramped. Test with `--height 375` when the page has either.

## Fluid type and spacing with clamp()

```css
h1      { font-size: clamp(2rem, 1rem + 5vw, 4rem); }
section { padding-block: clamp(3rem, 8vw, 6rem); }
```

`clamp(min, preferred, max)` scales between two sizes with no breakpoints.
Always include a `rem` term in the preferred value (`1rem + 5vw`, not `5vw`):
text sized in `vw` alone ignores browser zoom and user font-size settings.

Use it for display headings and large section spacing. Body text should stay a
fixed `1rem` or a little more. If the project has stepped type utilities
(`text-3xl md:text-5xl`), use those instead of introducing `clamp()` alone in
one component.

## Container queries

Use a container query when a component appears in slots of different widths (a
card in a sidebar and in the main column), where the viewport width says
nothing about the space the component has.

```css
.card-slot { container-type: inline-size; }

@container (min-width: 28rem) {
  .card { display: grid; grid-template-columns: 8rem 1fr; }
}
```

Tailwind v4 has this built in: `@container` on the parent, `@sm:` `@md:` on
descendants. Tailwind v3 needs the `@tailwindcss/container-queries` plugin.
Supported in all current browsers since 2023.

Page-level layout (how many columns the page has) still belongs to media
queries.

## Viewport units on phones

Mobile browsers show and hide their toolbars as the user scrolls, so "viewport
height" has three values:

| Unit   | Meaning                          | Use for |
|--------|----------------------------------|---------|
| `svh`  | Height with toolbars showing     | Hero sections that must fit above the fold |
| `lvh`  | Height with toolbars hidden      | Rarely needed |
| `dvh`  | Current height, changes on scroll | Full-height app shells, modals, drawers |
| `vh`   | Same as `lvh` on most phones     | Avoid for full-height layouts |

`height: 100vh` on a phone is taller than what the user sees, so a bottom
button ends up under the toolbar. Use `min-height: 100svh` for heroes and
`height: 100dvh` for app shells. Tailwind: `min-h-svh`, `h-dvh` (v3.4 and later).

Prefer `min-height` to `height` so content that is taller than the screen can
still grow.

## A grid that needs no media queries

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}
```

The grid fits as many 16rem columns as it can and shares out the remainder. The
`min(100%, 16rem)` guard stops it overflowing a container narrower than 16rem.
Use `auto-fill` in place of `auto-fit` if a short last row should keep its card
width.
