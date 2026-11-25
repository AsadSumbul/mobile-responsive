# Component patterns on small screens

Read the section for the component you are building. Each gives the usual
mobile failure and the patterns that avoid it. Use the project's own primitives
(a `Sheet`, `Drawer`, `Dialog`, or `Table` component) when they exist.

## Contents

- Navigation
- Data tables
- Forms
- Modals, drawers, and popovers
- Images and media
- Sticky and fixed bars
- Hero sections
- Card grids
- Sidebars and dashboards

## Navigation

**Failure:** a horizontal link row wraps into two or three ragged lines, or
pushes the page wider than the screen.

- Below the project's nav breakpoint (often `md` or `lg`), collapse the links
  behind a menu button that opens a drawer, sheet, or full-width dropdown.
- The toggle is a real `<button>` with `aria-expanded` and `aria-controls`, at
  least 44x44px. Close the menu on link click, on Escape, and on route change.
- Keep the logo and the one primary action (Sign in, Cart) visible outside the
  menu.
- Pick the breakpoint by content: switch at the width where the full row stops
  fitting with comfortable spacing, including the longest translated labels.
- A site with three to five top-level destinations can use a bottom tab bar on
  phones. Pad it with `env(safe-area-inset-bottom)`.
- Dropdown submenus that open on hover need to open on tap as well.

```jsx
<nav className="flex items-center justify-between px-4 py-3">
  <Logo />
  <ul className="hidden items-center gap-6 md:flex">{links}</ul>
  <button
    className="inline-flex size-11 items-center justify-center md:hidden"
    aria-expanded={open}
    aria-controls="mobile-menu"
    aria-label="Menu"
    onClick={() => setOpen(!open)}
  >
    <MenuIcon />
  </button>
</nav>
```

## Data tables

**Failure:** the table forces the page wider than the screen, or columns are
squeezed until every cell wraps to four lines.

Choose by what the user does with the data:

1. **Compare across rows** (prices, stats): keep the table and let it scroll
   inside a wrapper. Consider a sticky first column so rows stay identifiable.

   ```html
   <div class="overflow-x-auto">
     <table class="min-w-[640px] w-full">...</table>
   </div>
   ```

   Give the wrapper `tabindex="0"`, `role="region"`, and an `aria-label` so
   keyboard users can scroll it.
2. **Look up one record** (orders, users): render each row as a stacked card on
   phones, with label and value pairs, and switch to the table at `md`.
3. **Too many columns either way:** hide the low-priority columns on small
   screens (`hidden md:table-cell`) and expose them in a detail view.

Never shrink table text below about 14px to make it fit.

## Forms

**Failure:** side-by-side fields too narrow to type in, iOS zooming on focus,
the wrong keyboard, the submit button hidden behind the keyboard.

- One column on phones. Pair only short related fields (city and postcode,
  expiry and CVC), and only from `sm` up.
- Labels above fields, not beside them.
- Field text at 16px or more, to stop iOS Safari zooming the page on focus.
- Fields and buttons at least 44px tall. The primary button is usually full
  width on phones (`w-full sm:w-auto`).
- Set `type`, `inputmode`, and `autocomplete` so the right keyboard and autofill
  appear: `type="email"`, `type="tel"`, `inputmode="numeric"`,
  `autocomplete="one-time-code"`.
- Put error messages directly under their field, so they are visible while the
  keyboard is open.
- Radio and checkbox targets: make the whole label row tappable, not just the
  13px box.

## Modals, drawers, and popovers

**Failure:** a 600px dialog wider than the phone, content taller than the screen
with no way to scroll to the buttons, the page scrolling behind it.

- Width: `width: 100%; max-width: 32rem` with a margin, or full-screen or a
  bottom sheet on phones.
- Height: `max-height: 100dvh` (minus a margin) with the body scrolling
  internally (`overflow-y: auto`) and the header and action row staying visible.
- Lock background scroll while open, and add `overscroll-behavior: contain` on
  the scrolling area.
- Keep the close button at least 44px and inside the viewport.
- Popovers and tooltips anchored to a trigger must flip or shift to stay on
  screen. Use the positioning library the project already has.
- Prefer the native `<dialog>` element or the project's dialog primitive, which
  handle focus trapping and Escape.

## Images and media

**Failure:** an image wider than the screen, layout jumping as images load, a
4000px image downloaded onto a phone.

- Global baseline: `img, video, svg { max-width: 100%; height: auto; }`.
- Reserve space to prevent layout shift: `width` and `height` attributes, or
  `aspect-ratio` on the container.
- Fixed-shape slots (avatars, card covers): `object-fit: cover` on the image
  inside a box with a set aspect ratio.
- Serve sized images: `srcset` with `sizes`, or the framework's image component
  (`next/image`, `astro:assets`, `nuxt-img`).
- `loading="lazy"` for images below the fold, not for the hero image.
- Embeds (video, maps): a wrapper with `aspect-ratio: 16 / 9` and the iframe at
  `width: 100%; height: 100%`.
- When the wide crop does not work on a phone, use `<picture>` with a different
  source for small screens.

## Sticky and fixed bars

**Failure:** a fixed header and a fixed footer eat half of a small landscape
screen, or a fixed bar covers the last piece of content.

- Keep sticky headers short on phones (about 56px).
- Pad the page so the last content clears a fixed bottom bar.
- Add `env(safe-area-inset-bottom)` to bottom bars, and set
  `viewport-fit=cover` in the viewport meta tag for the inset to apply.
- `position: sticky` stops working when an ancestor has `overflow: hidden`,
  `auto`, or `scroll`. That is a common side effect of an overflow "fix" higher
  up the tree.
- Set `scroll-margin-top` on anchor targets so a sticky header does not cover
  them.

## Hero sections

**Failure:** a 72px headline wrapping to six lines, `100vh` pushing the button
under the browser toolbar, an image squeezed beside the text.

- Stack text above the image on phones. Go side by side from `md` or `lg`.
- Headline with `clamp()`, for example `clamp(2rem, 5vw + 1rem, 4.5rem)`, and
  `text-wrap: balance` for tidier line breaks.
- Use `min-height: 100svh` if the hero should fill the screen, never a fixed
  `height`, so tall content can still grow.
- Buttons: stacked and full width on phones, inline from `sm`
  (`flex flex-col gap-3 sm:flex-row`).
- Check the landscape phone case (about 667x375): the headline and the primary
  button should be visible without scrolling far.

## Card grids

**Failure:** fixed-width cards in a non-wrapping row, or three cramped columns
on a phone.

- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, or the query-free form
  `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`.
- Use `gap` on the grid, not margins on the cards.
- Let card height follow content. For equal heights in a row, rely on grid
  stretch and push the footer down with `margin-top: auto` in a flex column.
- With `auto-fit`, a lone last card stretches full width. Use `auto-fill` if
  cards should keep their size.

## Sidebars and dashboards

**Failure:** a 260px sidebar permanently taking most of a 375px screen.

- Phones: the sidebar becomes an off-canvas drawer opened from the header.
- Tablets: an icon-only rail is a good middle state.
- Desktop: the full sidebar, with the content column as `minmax(0, 1fr)` so wide
  charts and tables inside it cannot stretch the page.
- Stat tiles go two per row on phones, four from `lg`. Charts need a container
  with a set height or aspect ratio and a library configured to resize.
