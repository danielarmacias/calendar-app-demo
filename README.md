# Calendar App

A simple, dependency-free month-view calendar. Add, edit, and delete events, all stored locally in your browser via `localStorage`. No build step, no framework — just open `index.html`.

## Features

- **Month grid view** with previous/next navigation and a "Today" shortcut
- **Add / edit / delete events** through a modal (title, date, optional time, optional description)
- **Persistence** via `localStorage` (events survive page reloads)
- **Validation**: title and date are required, with inline error messages
- **Responsive UI**: adapts down to mobile widths with no horizontal overflow

## Screenshots

### Month view
![Month view](screenshots/month-view-desktop.png)

### Add event modal
![Add event modal](screenshots/add-event-modal.png)

### Mobile responsive view
![Mobile view](screenshots/month-view-mobile.png)

## Usage

Clone the repo and open `index.html` directly in a browser:

```bash
git clone https://github.com/danielarmacias/calendar-app-demo.git
cd calendar-app-demo
open index.html   # or double-click the file
```

Click a day (or "+ Add Event") to create an event, click an existing event to edit or delete it.

## Project structure

```
index.html   Page markup (grid container, modal)
styles.css   Responsive grid and modal styling
app.js       Rendering, localStorage persistence, modal/form logic
```
