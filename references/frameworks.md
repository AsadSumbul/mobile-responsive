# Framework-specific responsive syntax

Read the section for the project's stack. Use the stack that is already there,
and do not add a second styling system beside it.

## Tailwind CSS

Unprefixed utilities apply at every width. `sm:` `md:` `lg:` `xl:` `2xl:` apply
at that width and up.

| Need | Classes |
|---|---|
| Stack, then row | `flex flex-col md:flex-row` |
| Responsive grid | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Fluid width with a cap | `w-full max-w-3xl` |
| Shrinkable flex child | `min-w-0` (add `truncate` for an ellipsis) |
| Grid track that can shrink | `grid-cols-[minmax(0,1fr)_16rem]` |
| Media | `max-w-full h-auto`, `aspect-video`, `object-cover` |
| Long strings | `break-words` (`wrap-anywhere` in v4.1+) |
| Scrollable table | wrap in `overflow-x-auto` |
| Padding and gap | `px-4 md:px-8`, `gap-4 md:gap-8` |
| Reading width | `max-w-prose` |
| Tap target | `min-h-11 min-w-11` (44px), `size-11` for icon buttons |
| Show or hide | `hidden md:block`, `md:hidden` |
| Small screens only | `max-md:...` |
| Full height | `min-h-svh`, `h-dvh` |
| Hover only where hover exists | v4 does this by default; in v3 set `future.hoverOnlyWhenSupported` |

**Version differences that matter here:**

- **v3:** breakpoints and tokens live in `tailwind.config.js` under `theme` and
  `theme.extend`. Container queries need `@tailwindcss/container-queries`.
- **v4:** configuration lives in CSS. Look for `@import "tailwindcss"` and an
  `@theme { ... }` block with `--breakpoint-*`, `--spacing`, `--color-*`.
  There may be no config file at all. Container queries are built in:
  `@container` on the parent, `@sm:` `@md:` on descendants.

Check `package.json` for the version before assuming either.

Class order does not decide which rule wins; the breakpoint does. Avoid
arbitrary breakpoints (`min-[900px]:`) unless the project already uses them.

Many Tailwind projects use shadcn/ui or a similar kit. Use its `Sheet`,
`Dialog`, `Drawer`, and `Table` components for mobile patterns before writing
your own.

## Plain CSS and SCSS

```css
*, *::before, *::after { box-sizing: border-box; }
img, video, svg { max-width: 100%; height: auto; }

.layout { display: grid; gap: 1.5rem; }

@media (min-width: 48rem) {
  .layout { grid-template-columns: minmax(0, 1fr) 18rem; }
}
```

- Mobile-first: base rules for phones, `@media (min-width: ...)` for wider.
- Tokens as custom properties: `var(--space-4)`, `var(--color-accent)`.
- Custom properties cannot be used inside a media query condition. In SCSS, use
  a variable map with a mixin (follow the one the project has). In plain CSS,
  repeat the literal value and keep it consistent.
- Logical properties (`padding-inline`, `margin-block`) keep layouts correct in
  right-to-left languages.

## CSS Modules

The same CSS, scoped per component. Keep tokens in one global stylesheet on
`:root` and reference them with `var(--...)` from each module. If the project
shares breakpoints through `@custom-media` or a Sass partial, import that
instead of retyping pixel values.

## styled-components and Emotion

```js
const Card = styled.div`
  width: 100%;
  max-width: 37.5rem;
  padding: ${({ theme }) => theme.space[4]};

  ${({ theme }) => theme.media.md} {
    padding: ${({ theme }) => theme.space[8]};
  }
`;
```

Take spacing and breakpoints from the theme object. Projects usually have a
media helper (`theme.media.md`, `mq.md`, `breakpoints.up('md')`): find it and
use it instead of writing raw `@media` strings.

## Component libraries (MUI, Chakra, Mantine)

These have responsive props. Use them in place of custom media queries:

- MUI: `sx={{ p: { xs: 2, md: 4 } }}`, `<Grid size={{ xs: 12, md: 6 }}>`,
  `theme.breakpoints.up('md')`, `useMediaQuery`
- Chakra: `p={{ base: 4, md: 8 }}`, `<SimpleGrid columns={{ base: 1, md: 3 }}>`
- Mantine: `p={{ base: 'md', md: 'xl' }}`, `visibleFrom="md"`, `hiddenFrom="md"`

Prop names change between major versions. Check how the project's existing
code writes them and match that.

Prefer CSS-based responsiveness (props, classes) to JavaScript width checks
such as `useMediaQuery`. JavaScript checks do not run during server rendering,
so the page flashes the wrong layout before hydration.

## Bootstrap

- Grid: `.container` > `.row` > `.col-12 .col-md-6 .col-lg-4`. Column classes
  are mobile-first. Gutters: `.g-3 .g-md-4`.
- Utilities: `.d-none .d-md-block`, `.p-3 .p-md-5`, `.flex-column .flex-md-row`.
- Tables: `.table-responsive` on a wrapper.
- Navigation: `.navbar-expand-md` with the collapse component.
- Images: `.img-fluid`. Use the spacing utilities in place of custom pixel
  values.

## Flutter

Flutter does not use CSS, but the same approach holds:

- Branch on available width with `LayoutBuilder` (the parent's constraints) in
  preference to `MediaQuery.sizeOf(context)` (the whole screen).
- `Expanded` and `Flexible` inside `Row` and `Column` prevent
  `RenderFlex overflowed`, Flutter's version of horizontal overflow.
- `Wrap` in place of `Row` when children may not fit on one line.
- Wrap long content in `SingleChildScrollView`, and screen edges in `SafeArea`.
- Keep spacing and text styles in `ThemeData` or a constants file, and reuse
  them across widgets.

`scripts/check-overflow.js` inspects the DOM, so it does not work on Flutter
web's canvas output. Use Flutter's own overflow warnings and widget tests.
