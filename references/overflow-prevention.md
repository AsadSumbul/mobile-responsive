# Overflow prevention: causes, fixes, and debugging

Read this when a page scrolls sideways or content is cut off, or to harden a
layout before shipping it.

## The model

The page overflows when some element is wider than the viewport and no ancestor
clips or scrolls it. One element is usually responsible, and everything else
that looks broken is a consequence. Find that element and change how it sizes
itself.

Do not reach for `overflow-x: hidden` on `html` or `body`. It hides the
scrollbar and leaves the content cut off, it turns the element into a scroll
container (which breaks `position: sticky` beneath it), and on iOS Safari
setting it on `body` alone often does not stop the sideways scroll.

## Causes and fixes

### 1. Fixed pixel widths

```css
/* overflows below 600px */  .box { width: 600px; }
/* fluid with a cap */       .box { width: 100%; max-width: 600px; }
```

Tailwind: `w-full max-w-[600px]`. The same applies to `min-width` in pixels and
to `flex-basis` with `flex-shrink: 0`.

### 2. Flex and grid children that will not shrink

Flex and grid items default to `min-width: auto`, which means "never narrower
than my content". A long word, a wide image, a `<pre>`, or a `nowrap` child then
forces the item, and the page, wider.

```css
.flex-child { min-width: 0; }
.grid { grid-template-columns: minmax(0, 1fr) 20rem; }  /* not 1fr 20rem */
```

Tailwind: `min-w-0` on the child, `grid-cols-[minmax(0,1fr)_20rem]`. Add
`truncate` when the text should end in an ellipsis. This is the most common
cause in app layouts (sidebar plus content) and the least obvious.

### 3. Rows that do not wrap

A flex row of buttons, tags, or cards with `flex-wrap: nowrap` (the default)
and children that cannot shrink.

```css
.row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
```

Or stack on phones and switch to a row at a breakpoint
(`flex flex-col sm:flex-row`). For a deliberate horizontal scroller (chips, a
carousel), put `overflow-x: auto` on the row itself.

### 4. Oversized media

```css
img, video, iframe, svg, canvas { max-width: 100%; height: auto; }
```

Tailwind: `max-w-full h-auto` (its preflight already does this for `img` and
`video`). HTML `width`/`height` attributes are fine and prevent layout shift;
the CSS above still lets the image shrink.

### 5. Long unbroken strings

URLs, email addresses, hashes, and file paths have no break opportunities.

```css
.text { overflow-wrap: anywhere; }
```

Tailwind: `break-words` (v4.1 and later also has `wrap-anywhere`). Inside a flex
item, `overflow-wrap: break-word` alone is not enough because it does not reduce
the item's minimum content width. Add `min-w-0` to the item, or use `anywhere`.
Use `break-all` only for strings with no words at all.

### 6. Wide tables

Let the table scroll inside its own wrapper:

```html
<div style="overflow-x: auto"><table>...</table></div>
```

See the tables section of `components.md` for alternatives.

### 7. Code blocks and preformatted text

```css
pre { overflow-x: auto; max-width: 100%; }
```

When the `<pre>` sits in a flex or grid item, that item also needs
`min-width: 0`, or the block will push it wider instead of scrolling.

### 8. `100vw`

`100vw` is the viewport width including the vertical scrollbar, so on any
platform with classic scrollbars it is wider than the page. Use `width: 100%`.
`100dvw` has the same problem. For a full-bleed section inside a padded
container, use negative margins equal to the container padding.

### 9. Negative margins, absolute positioning, transforms

Decorative blobs, badges offset with `right: -2rem`, off-canvas menus parked
with `translateX(100%)`, and negative-margin gutters can all extend past the
edge. Clip them on the nearest sized ancestor:

```css
.section { position: relative; overflow: hidden; }  /* or overflow: clip */
```

An off-canvas panel that is `position: fixed` does not widen the page. One that
is `position: absolute` does.

### 10. Missing `box-sizing: border-box`

With the default `content-box`, `width: 100%` plus padding or a border is wider
than the parent. Confirm the reset exists:

```css
*, *::before, *::after { box-sizing: border-box; }
```

### 11. Grid tracks with a fixed minimum

`repeat(auto-fit, minmax(16rem, 1fr))` overflows when the container is narrower
than 16rem. Guard it: `minmax(min(100%, 16rem), 1fr)`.

### 12. `white-space: nowrap`

Buttons, badges, and table cells with `nowrap` (`whitespace-nowrap`) and long or
translated labels. Allow wrapping on small screens, or truncate with
`overflow: hidden; text-overflow: ellipsis` and a `max-width`.

### 13. Form controls

Inputs have an intrinsic width (about 20 characters) and `<select>` sizes to its
longest option. In a flex row they refuse to shrink. Give them `width: 100%`
and `min-width: 0`.

### 14. Third-party embeds

Ads, maps, video players, and widgets often set pixel widths inline. Wrap them
in a container with `max-width: 100%; overflow: hidden`, and use the embed's
responsive option when it has one.

## Finding the culprit

Run the script. It lists the outermost elements that pass the viewport edge at
each width:

```bash
node scripts/check-overflow.js http://localhost:3000 --widths 320,375
```

By hand, in the browser console at a narrow width:

```js
const vw = document.documentElement.clientWidth;
[...document.querySelectorAll('body *')]
  .filter(el => el.getBoundingClientRect().right > vw + 1)
  .forEach(el => console.log(el, Math.round(el.getBoundingClientRect().right - vw)));
```

The first elements logged are the outermost. Start there: if a container is the
right width but its child is not, the child (or the container's lack of
wrapping) is the cause.

Or make boxes visible:

```css
* { outline: 1px solid rgb(255 0 0 / 0.4); }
```

If nothing obvious shows up, delete sections in devtools until the scrollbar
disappears, then narrow down inside the section that made the difference.

## Clipping as a last line of defense

Once the real cause is fixed, a wrapper inside `body` can clip stray decorative
overflow:

```css
.page { overflow-x: clip; }
```

`clip` does not create a scroll container, so `position: sticky` keeps working,
which `hidden` would break. It is a safety net for decorations and never a
substitute for fixing an element that is too wide.
