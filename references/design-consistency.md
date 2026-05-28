# Design consistency: match what exists, set the pattern for what's next

The goal: a component you add today should look like it shipped alongside the
existing ones, and should give future components a pattern to copy. Read this to
extract a project's design language, or to establish one cleanly when none
exists.

## Why this matters

A "responsive" component that uses different spacing, type sizes, or breakpoints
than its neighbors looks broken even when it technically works. Consistency is
what makes a UI feel designed rather than assembled.

## Extracting the existing design language

Before building, audit two or three sibling components and any config/theme
files. Capture:

1. **Styling system.** Tailwind, CSS Modules, styled-components, vanilla CSS,
   Bootstrap, etc. Use the one already present. Never mix two.
2. **Spacing scale.** List the gap/padding/margin values actually used
   (e.g. `4, 8, 12, 16, 24, 32`). New components reuse these steps only.
3. **Type scale.** Heading and body sizes/weights/line-heights in use.
4. **Breakpoints.** The exact set the project responds at. Reuse it; don't
   invent a new one for one component.
5. **Color and tokens.** Theme variables / Tailwind theme / CSS custom properties.
   Reference tokens (`text-primary`, `--color-accent`), never duplicate a value
   with a raw hex.
6. **Container and rhythm.** The max-width and horizontal padding sections use, and
   the vertical spacing between stacked blocks.
7. **Radius, shadow, border.** Corner radius, elevation, and border conventions.
8. **Naming and structure.** How variants/props/slots are named, file layout.

Sources of truth, in order: `tailwind.config.*`, then a theme/tokens file, then
global CSS variables, then the components themselves.

## Matching it

- Snap every value to the existing scale. If cards use `p-6 gap-4 rounded-xl`,
  your new card uses the same, not `p-5 gap-3 rounded-lg`.
- Respond at the same breakpoints the rest of the page responds at, so columns
  collapse in unison instead of at staggered widths.
- Reuse shared primitives (Button, Card, Container) instead of re-rolling them.
- Keep vertical rhythm: the space above/below your section should match the
  spacing between other sections.

## When there is NO system yet

Establish a small, clean one and apply it consistently so it becomes the
project's de-facto standard:

- **Spacing:** a single scale, e.g. `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` px.
- **Type:** a modular scale, e.g. `0.875 / 1 / 1.25 / 1.5 / 2 / 3` rem, with
  defined weights for heading vs body.
- **Breakpoints:** `640 / 768 / 1024 / 1280` (Tailwind defaults are a safe base).
- **Radius/shadow:** two or three tiers each, no more.
- **Tokens:** define colors/spacing as CSS variables or Tailwind theme keys so
  later components reference names, not literals.

Put these in one place (config or a tokens file) and note it, so future work has
a single source of truth.

## Forward compatibility (looking good with upcoming components)

- Build components **composable and self-contained**: predictable outer spacing,
  no reliance on a sibling's margins, no fixed heights that break when content
  changes.
- Use the shared scale and tokens so anything added later automatically aligns.
- Prefer `gap` on the parent over margins on children, so adding/removing items
  keeps rhythm intact.
- Avoid magic numbers; a future component reusing the same tokens will line up
  for free.
