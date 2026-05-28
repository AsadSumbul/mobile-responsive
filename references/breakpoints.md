# Breakpoints, devices, and fluid sizing

Read when you need exact values for breakpoints, device widths, container
queries, or fluid type.

## Tailwind default breakpoints (all min-width)

| Prefix | Min width | Typical target              |
|--------|-----------|-----------------------------|
| (none) | 0px       | Phones, base styles         |
| `sm:`  | 640px     | Large phone / small tablet  |
| `md:`  | 768px     | Tablet                      |
| `lg:`  | 1024px    | Laptop                      |
| `xl:`  | 1280px    | Desktop                     |
| `2xl:` | 1536px    | Large desktop               |

Every prefix is **min-width**: `md:flex` applies at 768px **and wider**. Write
the unprefixed class for mobile, then override upward. If the project's
`tailwind.config` customizes these, use the project's values, not these defaults.

## Plain-CSS equivalent (mobile-first)

```css
.card { width: 100%; padding: 1rem; }            /* base = mobile */

@media (min-width: 768px) {
  .card { width: 50%; padding: 2rem; }
}
@media (min-width: 1024px) {
  .card { width: 33.333%; }
}
```

## Device test matrix

| Width   | Device class                       | Why it matters                 |
|---------|------------------------------------|--------------------------------|
| 320px   | Smallest phones / split-screen     | The hardest case, test first   |
| 360px   | Common Android                     | Very widespread                |
| 375px   | Standard iPhone                    | Baseline phone                 |
| 414px   | Large phone (Plus/Pro Max)         | Wide phone reflow              |
| 768px   | Tablet portrait                    | Single to multi column shift   |
| 1024px  | Tablet landscape / small laptop    | Sidebar/nav decisions          |
| 1280px  | Desktop                            | Full layout                    |
| 1440px+ | Large desktop                      | Max-width capping needed       |

Also consider **landscape phones** (short height, around 640x360), and avoid
`100vh` heroes that hide content. Prefer `min-h-screen` with scrollable content,
or `100dvh`/`100svh` to handle mobile browser chrome.

## Fluid type with clamp()

```css
h1 { font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem); }
```
`clamp(min, preferred, max)` scales smoothly between sizes with no breakpoints.
The `+ 1rem` term keeps small screens readable. Great for hero headings.

## Container queries: respond to a component's own width

Use when a component lives in different-width slots (sidebar vs. full width) and
should adapt to its container, not the viewport.

```css
.wrapper { container-type: inline-size; }

@container (min-width: 400px) {
  .item { display: grid; grid-template-columns: 1fr 1fr; }
}
```
Tailwind: add `@container` to the parent, then `@sm: @md:` on children.

## Responsive grid pattern that never needs media queries

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}
```
The `min(100%, 16rem)` guard prevents overflow when the container is narrower
than the track's minimum.
