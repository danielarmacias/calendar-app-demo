# Todo: Restyle calendar app with Tailwind CSS (latest, via Play CDN)

## Context
- Project is plain static HTML/CSS/JS, no build tooling, no package.json.
- Confirmed via context7 (`/websites/tailwindcss`) that Tailwind v4's Play CDN
  (`https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`) is the correct approach for a
  no-build static site — it JIT-compiles utility classes found in the DOM, including
  classes added dynamically by JS (it uses a MutationObserver).
- Custom theme values (colors, month gradients) can be defined via an in-page
  `<style type="text/tailwindcss">` block using `@theme`.

## Plan
- [x] Add the Tailwind Play CDN `<script>` tag to `index.html` `<head>`.
- [x] Remove the `<link rel="stylesheet" href="styles.css">` tag once everything is ported.
- [x] Add a `<style type="text/tailwindcss">` block in `index.html` defining `@theme` tokens
      for the custom accent/border/muted colors currently in `:root` in styles.css.
- [x] Rewrite `index.html` markup to use Tailwind utility classes in place of the current
      custom classes (`.app`, `.toolbar`, `.icon-btn`, `.btn`, `.btn-primary`, `.btn-danger`,
      `.modal-overlay`, `.modal`, `.field`, etc.).
- [x] Update `app.js` where it creates elements/classNames dynamically
      (`day-cell`, `outside`, `today`, `day-number`, `day-events`, `event-chip`,
      `week-number`, `week-col-label`, and `body.className = theme-N`) to use Tailwind
      utility classes instead, since these are generated at runtime.
- [x] Recreate the 12 month background themes (gradient + accent color per month) using
      Tailwind arbitrary values / CSS variables set inline via JS (since Tailwind utility
      classes are static, per-month dynamic colors need a CSS variable set on `body.style`,
      referenced by Tailwind's `bg-[var(--...)]` arbitrary-value syntax).
- [x] Keep the floral background pattern and bottom-right emoji watermark, ported to
      Tailwind-friendly inline styles/utilities.
- [x] Preserve all existing behavior exactly: month navigation, today highlight, add/edit/
      delete event modal, validation, responsive breakpoints (mobile grid sizing).
- [x] Delete `styles.css` once no longer referenced.
- [x] Manually verify in a browser: month view renders, today highlight, add/edit/delete
      event flow, responsive layout at narrow width, month theme colors changing correctly.

## Review

**What changed:**
- Added the Tailwind CSS v4 Play CDN script (`@tailwindcss/browser@4`) to `index.html` —
  no build step needed, consistent with this being a plain static site.
- Added a single `<style type="text/tailwindcss">` block defining `@theme` tokens
  (`--color-border`, `--color-danger`, `--color-muted`, `--color-bg-muted`, `--color-accent`)
  so components can use plain Tailwind utilities like `border-border`, `text-danger`,
  `bg-accent`, etc.
- Rewrote every element in `index.html` to use Tailwind utility classes instead of the old
  `styles.css` classes (`.app`, `.toolbar`, `.btn`, `.modal`, `.field`, ...).
- Kept the floral SVG background pattern, the per-month gradient, and the emoji watermark as
  a small amount of plain CSS inside the same `<style>` block, since these are dynamic
  multi-layer backgrounds and a `content: attr()` pseudo-element that utility classes can't
  express. The 12 `body.theme-N` rules now override `--color-accent` (a Tailwind theme
  variable) directly, so every `bg-accent`/`text-accent`/`border-accent` utility automatically
  repaints with the month's accent color — no JS changes needed for color, only for adding
  the theme class to `<body>`.
- Updated `app.js` so every dynamically-created element (`day-cell`, `day-number`,
  `day-events`, `event-chip`, `week-number`, the "Sem" week-column label, weekday labels) sets
  Tailwind utility classes instead of the old custom class names. `applyMonthTheme` now
  preserves a constant set of base body classes when it swaps in the `theme-N` class, since it
  fully overwrites `body.className` each render.
- Deleted `styles.css` — everything it did now lives in Tailwind utilities or the small
  `@theme`/custom-CSS block in `index.html`.
- Kept the `[hidden] { display: none !important; }` override (same fix the original CSS had)
  since the modal overlay's `flex` utility would otherwise beat the `hidden` attribute's
  UA-stylesheet rule, same specificity issue as before.

**Verification performed:**
Drove the app with a Playwright script (headless Chromium) against the real `index.html`:
- Month grid renders with the correct label and day cells; today's cell shows the accent-
  colored circular highlight.
- Add Event modal opens, event saves, appears as a chip, edit modal reopens with Delete
  visible, delete removes the chip — full CRUD cycle works.
- Month navigation advances the label and swaps the `body` theme class/background correctly.
- No horizontal overflow at a 375px mobile viewport; responsive breakpoints (grid columns,
  font sizes, padding) look correct in a screenshot.
- Zero browser console errors.

No functional regressions found; visual design is unchanged from the previous CSS version,
now implemented entirely with Tailwind utilities plus a minimal custom-CSS block for what
utilities can't express (dynamic backgrounds, pseudo-elements).
