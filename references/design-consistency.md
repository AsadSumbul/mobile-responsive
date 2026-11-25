# Design consistency: match what exists, set a pattern for what comes next

Read this to work out a project's design language before adding to it, or to
set one up when the project has none.

A component that is responsive but uses its own spacing, type sizes, or
breakpoints still looks wrong next to its neighbors: its columns collapse at a
different width, its padding is slightly off, its heading is a size nobody else
uses. Users read that as a bug.

## Reading the existing design language

Check these sources in order, and stop when you have what the task needs:

1. **Theme config:** `tailwind.config.*`, the `@theme` block in Tailwind v4 CSS,
   a `theme.ts` or tokens file, Sass variables, a component library's theme.
2. **Global CSS:** custom properties on `:root`, base element styles.
3. **Two or three neighboring components** of the same kind as the one you are
   building. These show which tokens are used in practice, which matters more
   than which tokens exist.

Note what the task needs from this list:

| What | Look for |
|---|---|
| Styling system | Tailwind, CSS Modules, styled-components, vanilla CSS, Bootstrap, a UI kit |
| Breakpoints | The exact set, and whether the code is min-width or max-width |
| Spacing | The steps in use (`gap-4 gap-6 gap-8`, or `--space-*`) |
| Type | Sizes, weights, and line heights for headings and body |
| Color | Token names (`text-muted-foreground`, `--color-accent`), light and dark variants |
| Container | Max-width and side padding shared by page sections |
| Section rhythm | Vertical space between stacked sections |
| Shape | Radius, border, and shadow conventions |
| Primitives | `Button`, `Card`, `Container`, `Stack`, dialog and drawer components |
| Naming | How variants, props, and class names are written |

## Matching it

- **Use the existing steps.** If cards here use `p-6 gap-4 rounded-xl`, a new
  card does too, not `p-5 gap-3 rounded-lg`.
- **Reflow at the same breakpoints** as the rest of the page, so columns
  collapse together.
- **Reference tokens** instead of writing the raw value they stand for. A
  hard-coded `#4f46e5` will not follow the theme into dark mode or a rebrand.
- **Reuse primitives.** A second, slightly different button is a maintenance
  cost and a visual inconsistency.
- **Match the container.** A new section's content should line up with the left
  and right edges of the sections above and below it at every width.
- **Follow local conventions even when you would choose differently.** If the
  codebase is desktop-first with `max-width` queries, write the new component
  that way and say so in your report. A mixed codebase is harder to maintain
  than a consistently desktop-first one.

When the existing pattern is itself broken on mobile (the shared container has
no side padding, the shared card has a fixed width), do not silently copy the
bug or silently rewrite the shared code. Make your component work, and tell the
user what you found in the shared piece.

## When there is no system yet

In a new or unstyled project, set up a small token set in one place and use it
for everything you build:

- **Spacing:** one scale, for example `4 8 12 16 24 32 48 64 96` px.
- **Type:** a short scale, for example `0.875 1 1.125 1.5 2 3` rem, with set
  weights and line heights for headings and body.
- **Breakpoints:** `640 768 1024 1280` px is a safe default.
- **Container:** one max-width (about 72rem to 80rem) and one fluid side
  padding, such as `clamp(1rem, 4vw, 2rem)`.
- **Radius and shadow:** two or three levels of each.
- **Color:** named roles (background, surface, text, muted text, border,
  accent), not raw values at the point of use.

```css
:root {
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem;
  --container: 72rem;
  --gutter: clamp(1rem, 4vw, 2rem);
  --radius: 0.75rem;
  --color-bg: #fff; --color-text: #0f172a; --color-muted: #475569;
  --color-border: #e2e8f0; --color-accent: #4f46e5;
}
.container { width: 100%; max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter); }
```

With Tailwind, the defaults already are a system: use them as they are and
avoid arbitrary values (`p-[13px]`) unless a design calls for one.

Mention in your report where the tokens live, so later work builds on them.

## Building for components that come later

- **Components do not set their own outer margins.** The parent spaces its
  children with `gap`. A component with a built-in `margin-top` lines up in one
  place and not in the next.
- **Width comes from the parent.** A component fills the slot it is given
  (`width: 100%`) and the layout decides how wide that slot is. Then the same
  card works in a three-column grid, a sidebar, and a modal.
- **No fixed heights on anything holding text.** Translations, longer names, and
  larger font settings will all exceed them.
- **Design for the awkward content:** a 40-character name, a missing image, an
  empty list, a price with six digits. Layouts that survive those survive real
  data.
