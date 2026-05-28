# Framework-specific responsive syntax

Read the section matching the project's stack. Always match the stack already in
use, and never introduce a second styling system.

## Tailwind CSS

- Breakpoint prefixes are min-width: `sm: md: lg: xl: 2xl:`. Base class = mobile.
- Responsive layout: `flex flex-col md:flex-row`, `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Fluid width: `w-full max-w-[960px]`. Shrinkable flex child: `min-w-0`.
- Media: `max-w-full h-auto`. Text wrap: `break-words`. Table: wrap in `overflow-x-auto`.
- Padding/gap: `px-4 md:px-8`, `gap-4 md:gap-8`. Reading width: `max-w-prose`.
- Arbitrary breakpoints if the config defines them; otherwise reuse defaults.
- Container queries: `@container` on parent, `@sm: @md:` on children.

## Plain CSS / SCSS

- Mobile-first with `@media (min-width: ...)` only.
- Global reset: `*,*::before,*::after { box-sizing: border-box; }`.
- Fluid grid without queries:
  `grid-template-columns: repeat(auto-fit, minmax(min(100%,16rem),1fr));`
- Fluid type: `clamp(min, vw-based, max)`.
- Use CSS custom properties for tokens: `var(--space-4)`, `var(--color-accent)`.

## CSS Modules

- Same CSS rules as above, scoped per file. Keep shared tokens in a global
  `:root` stylesheet imported once, and reference them via `var(--...)` so modules
  stay consistent.

## styled-components / Emotion

```js
const Card = styled.div`
  width: 100%;
  max-width: 600px;
  padding: ${({theme}) => theme.space[4]};
  @media (min-width: ${({theme}) => theme.bp.md}) { padding: ${({theme}) => theme.space[8]}; }
`;
```
Pull spacing/breakpoints from the theme object so every styled component shares
one scale. Don't hard-code px that duplicates a theme value.

## Bootstrap

- Use the grid: `.container`, `.row`, `.col-12 .col-md-6 .col-lg-4` (mobile-first
  column classes). Responsive utilities: `.d-none .d-md-block`, `.p-3 .p-md-5`.
- Prefer Bootstrap's spacing utilities over custom px so spacing stays uniform.

## Flutter (web/mobile)

Not CSS, but the same principles apply for Flutter web targets:
- `LayoutBuilder` / `MediaQuery.of(context).size` to branch on width.
- `Flexible` / `Expanded` to prevent overflow; `FittedBox` to scale content.
- `Wrap` instead of `Row` when children may not fit.
- Define spacing/text constants once and reuse them across widgets for
  consistency. Watch for `RenderFlex overflowed`, the Flutter equivalent of
  horizontal overflow.
