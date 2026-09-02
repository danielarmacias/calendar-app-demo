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
- [ ] Add the Tailwind Play CDN `<script>` tag to `index.html` `<head>`.
- [ ] Remove the `<link rel="stylesheet" href="styles.css">` tag once everything is ported.
- [ ] Add a `<style type="text/tailwindcss">` block in `index.html` defining `@theme` tokens
      for the custom accent/border/muted colors currently in `:root` in styles.css.
- [ ] Rewrite `index.html` markup to use Tailwind utility classes in place of the current
      custom classes (`.app`, `.toolbar`, `.icon-btn`, `.btn`, `.btn-primary`, `.btn-danger`,
      `.modal-overlay`, `.modal`, `.field`, etc.).
- [ ] Update `app.js` where it creates elements/classNames dynamically
      (`day-cell`, `outside`, `today`, `day-number`, `day-events`, `event-chip`,
      `week-number`, `week-col-label`, and `body.className = theme-N`) to use Tailwind
      utility classes instead, since these are generated at runtime.
- [ ] Recreate the 12 month background themes (gradient + accent color per month) using
      Tailwind arbitrary values / CSS variables set inline via JS (since Tailwind utility
      classes are static, per-month dynamic colors need a CSS variable set on `body.style`,
      referenced by Tailwind's `bg-[var(--...)]` arbitrary-value syntax).
- [ ] Keep the floral background pattern and bottom-right emoji watermark, ported to
      Tailwind-friendly inline styles/utilities.
- [ ] Preserve all existing behavior exactly: month navigation, today highlight, add/edit/
      delete event modal, validation, responsive breakpoints (mobile grid sizing).
- [ ] Delete `styles.css` once no longer referenced (or leave an empty/removed file — confirm
      with user which they prefer).
- [ ] Manually verify in a browser: month view renders, today highlight, add/edit/delete
      event flow, responsive layout at narrow width, month theme colors changing correctly.

## Review
(to be filled in after implementation)
