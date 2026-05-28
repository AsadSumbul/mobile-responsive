# Overflow prevention: every cause and fix

Horizontal scroll on mobile is always a defect. Read this when content overflows
or to harden a layout against it.

## The mental model

Horizontal overflow happens when some element is wider than its container and
nothing clips or shrinks it. Fix it at the source (make the element behave),
not by hiding the symptom with `overflow-x: hidden` on `<body>` (that masks bugs
and can clip legitimate content).

## Causes and fixes

### 1. Fixed pixel widths
```css
/* bad */  .box { width: 600px; }
/* good */ .box { width: 100%; max-width: 600px; }
```
Tailwind: `w-full max-w-[600px]`.

### 2. Flex/grid children that refuse to shrink
Flex items have `min-width: auto` by default, so long content forces them wider
than the row.
```css
.child { min-width: 0; }     /* lets it shrink */
```
Tailwind: `min-w-0`. Add `truncate` if the text should ellipsize.

### 3. Oversized media
```css
img, video, iframe, svg { max-width: 100%; height: auto; }
```
Tailwind: `max-w-full h-auto`. For background images use `background-size: cover`.

### 4. Long unbroken strings (URLs, tokens, code, hashes)
```css
.text { overflow-wrap: anywhere; word-break: break-word; }
```
Tailwind: `break-words` (or `break-all` for code-like strings).

### 5. Wide tables
Don't shrink the table. Let it scroll inside its own wrapper:
```html
<div class="overflow-x-auto"><table>...</table></div>
```

### 6. `100vw`
`100vw` includes the vertical scrollbar's width, so it's a few px wider than the
viewport and overflows. Use `width: 100%` instead, or `100dvw` where supported.

### 7. Negative margins / absolute positioning
An element shifted with `margin-left: -2rem` or `left: ...` can poke past the
edge. Clip it with `overflow-hidden` on a properly sized parent, or constrain
its position responsively.

### 8. Padding/border on full-width boxes
Without `box-sizing: border-box`, `width:100%` + padding overflows. Modern resets
set this globally; confirm it's present:
```css
*, *::before, *::after { box-sizing: border-box; }
```

### 9. Pre-formatted text / code blocks
```css
pre { overflow-x: auto; white-space: pre; }   /* scroll the block, not the page */
```

### 10. Grid tracks with fixed minimums
`repeat(auto-fit, minmax(16rem, 1fr))` overflows when the container is under
16rem. Guard it: `minmax(min(100%, 16rem), 1fr)`.

## Debugging: find the culprit

Outline everything:
```css
* { outline: 1px solid red; }
```

Or log overflowing elements in the console:
```js
const docW = document.documentElement.clientWidth;
document.querySelectorAll('*').forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.right > docW + 1 || r.left < -1) console.log(el, r.right - docW);
});
```

Or use `scripts/check-overflow.js` (Playwright) to scan a URL at every device
width automatically.

## Guardrail (use sparingly)

As a final safety net, never a substitute for fixing the cause:
```css
html, body { overflow-x: clip; }   /* `clip` is safer than `hidden`: no scroll container */
```
Only after the real offender is fixed.
