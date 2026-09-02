# Calendar App - Todo

- [x] Scaffold `index.html` with header, calendar grid container, modal markup
  - Acceptance: page loads with no console errors; empty grid container present
- [x] Build `styles.css` responsive month grid + modal styles
  - Acceptance: grid displays 7 columns on desktop; collapses gracefully below 600px width; modal centers and overlays correctly
- [x] Implement month grid rendering logic in `app.js`
  - Acceptance: correct days shown for current month, correct weekday alignment, prev/next/today navigation works
- [x] Implement localStorage helpers (get/save/add/update/delete events)
  - Acceptance: events persist across page reloads; JSON structure matches data model
- [x] Implement add-event modal + form validation
  - Acceptance: clicking a day or "+ Add Event" opens modal; empty title blocked with inline error; valid event saves and appears on grid
- [x] Implement edit event (click existing event to reopen modal pre-filled)
  - Acceptance: editing and saving updates the correct event without duplicating it
- [x] Implement delete event
  - Acceptance: delete removes event from grid and localStorage immediately
- [x] Responsive/manual test pass across desktop and narrow mobile widths
  - Acceptance: no horizontal overflow, modal usable on small screens, all interactions work via touch/click
- [x] Write review section summarizing changes
- [x] Add ISO week number column to the left of the grid
  - Acceptance: each week row shows the correct ISO week number; column stays aligned and readable on mobile
- [x] Add a themed, floral background per month tied to a notable day (e.g. Mother's Day in May)
  - Acceptance: background gradient/emoji watermark and the special-day label change automatically on month navigation; text stays legible over every theme

## Review

Built a static, dependency-free Calendar app (month view) in `index.html`, `styles.css`, and `app.js`.

**What was built:**
- Month grid view with prev/next navigation, a "Today" button, and dimmed out-of-month padding days.
- Add/edit/delete events via a modal, with events stored as a JSON array under the `calendar-events` localStorage key.
- Basic validation: title required (trimmed), date required and must parse as a valid date; inline error messages shown instead of blocking silently.
- Responsive layout using CSS Grid with a breakpoint at 600px (smaller cells/fonts) and 420px (event chips per day capped to keep cells readable).

**Verification performed:**
Drove the app end-to-end with Playwright (headless Chromium) against the real `index.html` file:
- Confirmed the grid renders the correct number of day cells and month label.
- Confirmed empty-title submission is blocked with an inline error.
- Added an event, confirmed it appears as a chip, and confirmed it persists after a full page reload (localStorage working as expected).
- Edited the event and confirmed the chip text updated in place (no duplicate created).
- Deleted the event and confirmed it was removed from the grid.
- Confirmed month navigation (next month, then Today) updates the label correctly.
- Confirmed no horizontal page overflow at a 375px mobile viewport width.

**Bug found and fixed during verification:**
The modal overlay used `display: flex` in CSS while relying on the HTML `hidden` attribute to hide it. Browser default styles apply `[hidden] { display: none }`, but that UA-stylesheet rule is overridden by author stylesheets regardless of selector specificity — so the modal was actually visible and intercepting clicks even when marked `hidden`. Fixed by adding an explicit `.modal-overlay[hidden] { display: none; }` rule in `styles.css`.

No other issues found; all planned features work as expected.

**Follow-up: week numbers + monthly themes**
Added a `.week-number` column (ISO 8601 week number, computed per row from the row's first date) to the left of the grid and weekday header. Added twelve month themes (`app.js` `MONTH_THEMES` + `styles.css` `.theme-0`..`.theme-11`): a soft pastel gradient, an accent color (used for the "today" marker, primary button, and event chips via the `--accent` CSS variable), and an emoji watermark tied to a notable day of that month (New Year, Valentine's Day, International Women's Day, Earth Day, Mother's Day, Father's Day, Summer break, Friendship Day, Amor y Amistad, Halloween, Thanksgiving, Christmas). A shared delicate floral SVG pattern is layered under the gradient for a consistent soft aesthetic across all months, and `.app` sits as a semi-transparent card on top so grid content stays legible. Verified via Playwright that navigating months swaps the theme and special-day label correctly, and that the layout still holds up on a 375px viewport.
