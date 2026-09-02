(function () {
  "use strict";

  const STORAGE_KEY = "calendar-events";
  const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // One theme per month: a special/notable day plus an emoji + gradient
  // (defined in styles.css as .theme-0 .. .theme-11) used as the page background.
  const MONTH_THEMES = [
    { label: "Año Nuevo", emoji: "🎉" },
    { label: "Día de San Valentín", emoji: "💘" },
    { label: "Día Internacional de la Mujer", emoji: "🌸" },
    { label: "Día de la Tierra", emoji: "🌿" },
    { label: "Día de las Madres", emoji: "🌷" },
    { label: "Día del Padre", emoji: "⭐" },
    { label: "Vacaciones de Verano", emoji: "☀️" },
    { label: "Día de la Amistad", emoji: "🎈" },
    { label: "Amor y Amistad", emoji: "💌" },
    { label: "Halloween", emoji: "🎃" },
    { label: "Día de Acción de Gracias", emoji: "🍂" },
    { label: "Navidad", emoji: "🎄" },
  ];

  const state = {
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(), // 0-11
  };

  // ---------- localStorage helpers ----------

  function getEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to read events from localStorage", e);
      return [];
    }
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  function addEvent(event) {
    const events = getEvents();
    events.push(event);
    saveEvents(events);
  }

  function updateEvent(updated) {
    const events = getEvents().map((e) => (e.id === updated.id ? updated : e));
    saveEvents(events);
  }

  function deleteEvent(id) {
    const events = getEvents().filter((e) => e.id !== id);
    saveEvents(events);
  }

  function generateId() {
    return "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  // ---------- date helpers ----------

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatDateKey(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  function todayKey() {
    const now = new Date();
    return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = (d.getUTCDay() + 6) % 7; // Mon = 0 .. Sun = 6
    d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    return 1 + Math.round((d - firstThursday) / (7 * 24 * 3600 * 1000));
  }

  // ---------- DOM refs ----------

  const monthLabel = document.getElementById("monthLabel");
  const specialDayEl = document.getElementById("specialDay");
  const weekdaysEl = document.getElementById("weekdays");
  const gridEl = document.getElementById("calendarGrid");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const todayBtn = document.getElementById("todayBtn");
  const addEventBtn = document.getElementById("addEventBtn");

  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const eventForm = document.getElementById("eventForm");
  const eventIdInput = document.getElementById("eventId");
  const eventTitleInput = document.getElementById("eventTitle");
  const eventDateInput = document.getElementById("eventDate");
  const eventTimeInput = document.getElementById("eventTime");
  const eventDescriptionInput = document.getElementById("eventDescription");
  const titleError = document.getElementById("titleError");
  const dateError = document.getElementById("dateError");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const deleteEventBtn = document.getElementById("deleteEventBtn");

  // ---------- rendering ----------

  function renderWeekdays() {
    weekdaysEl.innerHTML = "";
    const weekLabel = document.createElement("div");
    weekLabel.className = "week-col-label";
    weekLabel.textContent = "Sem";
    weekdaysEl.appendChild(weekLabel);
    WEEKDAY_LABELS.forEach((label) => {
      const div = document.createElement("div");
      div.textContent = label;
      weekdaysEl.appendChild(div);
    });
  }

  function applyMonthTheme(viewMonth) {
    const theme = MONTH_THEMES[viewMonth];
    document.body.className = `theme-${viewMonth}`;
    document.body.dataset.emoji = theme.emoji;
    specialDayEl.textContent = `${theme.emoji} ${theme.label}`;
  }

  function createDayCell({ year, month, day, outside }, eventsByDate, today) {
    const dateKey = formatDateKey(year, month, day);
    const cell = document.createElement("div");
    cell.className = "day-cell" + (outside ? " outside" : "") + (dateKey === today ? " today" : "");
    cell.dataset.date = dateKey;

    const numberEl = document.createElement("div");
    numberEl.className = "day-number";
    numberEl.textContent = String(day);
    cell.appendChild(numberEl);

    const eventsWrap = document.createElement("div");
    eventsWrap.className = "day-events";
    (eventsByDate[dateKey] || []).forEach((evt) => {
      const chip = document.createElement("div");
      chip.className = "event-chip";
      chip.textContent = evt.time ? `${evt.time} ${evt.title}` : evt.title;
      chip.title = evt.title;
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal({ mode: "edit", event: evt });
      });
      eventsWrap.appendChild(chip);
    });
    cell.appendChild(eventsWrap);

    cell.addEventListener("click", () => {
      openModal({ mode: "add", date: dateKey });
    });

    return cell;
  }

  function renderCalendar() {
    const { viewYear, viewMonth } = state;
    applyMonthTheme(viewMonth);
    monthLabel.textContent = new Date(viewYear, viewMonth, 1).toLocaleDateString(
      undefined,
      { month: "long", year: "numeric" }
    );

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const events = getEvents();
    const eventsByDate = {};
    events.forEach((e) => {
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push(e);
    });
    Object.values(eventsByDate).forEach((list) =>
      list.sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    );

    const cells = [];
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startWeekday;
      let year = viewYear;
      let month = viewMonth;
      let day;
      let outside = false;

      if (dayOffset < 0) {
        day = daysInPrevMonth + dayOffset + 1;
        month = viewMonth - 1;
        if (month < 0) {
          month = 11;
          year -= 1;
        }
        outside = true;
      } else if (dayOffset >= daysInMonth) {
        day = dayOffset - daysInMonth + 1;
        month = viewMonth + 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
        outside = true;
      } else {
        day = dayOffset + 1;
      }

      cells.push({ year, month, day, outside });
    }

    gridEl.innerHTML = "";
    const today = todayKey();

    for (let w = 0; w < cells.length / 7; w++) {
      const weekCells = cells.slice(w * 7, w * 7 + 7);
      const firstDay = weekCells[0];
      const weekNumber = getISOWeek(new Date(firstDay.year, firstDay.month, firstDay.day));

      const weekNumEl = document.createElement("div");
      weekNumEl.className = "week-number";
      weekNumEl.textContent = String(weekNumber);
      gridEl.appendChild(weekNumEl);

      weekCells.forEach((cellInfo) => {
        gridEl.appendChild(createDayCell(cellInfo, eventsByDate, today));
      });
    }
  }

  // ---------- modal ----------

  function clearErrors() {
    titleError.textContent = "";
    dateError.textContent = "";
  }

  function openModal({ mode, date, event }) {
    clearErrors();
    eventForm.reset();

    if (mode === "edit" && event) {
      modalTitle.textContent = "Edit Event";
      eventIdInput.value = event.id;
      eventTitleInput.value = event.title;
      eventDateInput.value = event.date;
      eventTimeInput.value = event.time || "";
      eventDescriptionInput.value = event.description || "";
      deleteEventBtn.hidden = false;
    } else {
      modalTitle.textContent = "Add Event";
      eventIdInput.value = "";
      eventDateInput.value = date || todayKey();
      deleteEventBtn.hidden = true;
    }

    modalOverlay.hidden = false;
    eventTitleInput.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    const title = eventTitleInput.value.trim();
    if (!title) {
      titleError.textContent = "Title is required.";
      valid = false;
    }

    const dateValue = eventDateInput.value;
    if (!dateValue) {
      dateError.textContent = "Date is required.";
      valid = false;
    } else if (Number.isNaN(new Date(dateValue).getTime())) {
      dateError.textContent = "Enter a valid date.";
      valid = false;
    }

    return valid;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const id = eventIdInput.value;
    const payload = {
      id: id || generateId(),
      title: eventTitleInput.value.trim(),
      date: eventDateInput.value,
      time: eventTimeInput.value || "",
      description: eventDescriptionInput.value.trim(),
    };

    if (id) {
      updateEvent(payload);
    } else {
      addEvent(payload);
    }

    closeModal();
    renderCalendar();
  }

  function handleDelete() {
    const id = eventIdInput.value;
    if (!id) return;
    deleteEvent(id);
    closeModal();
    renderCalendar();
  }

  // ---------- navigation ----------

  function goToPrevMonth() {
    state.viewMonth -= 1;
    if (state.viewMonth < 0) {
      state.viewMonth = 11;
      state.viewYear -= 1;
    }
    renderCalendar();
  }

  function goToNextMonth() {
    state.viewMonth += 1;
    if (state.viewMonth > 11) {
      state.viewMonth = 0;
      state.viewYear += 1;
    }
    renderCalendar();
  }

  function goToToday() {
    const now = new Date();
    state.viewYear = now.getFullYear();
    state.viewMonth = now.getMonth();
    renderCalendar();
  }

  // ---------- init ----------

  function init() {
    renderWeekdays();
    renderCalendar();

    prevBtn.addEventListener("click", goToPrevMonth);
    nextBtn.addEventListener("click", goToNextMonth);
    todayBtn.addEventListener("click", goToToday);
    addEventBtn.addEventListener("click", () => openModal({ mode: "add", date: todayKey() }));

    closeModalBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
    });

    eventForm.addEventListener("submit", handleFormSubmit);
    deleteEventBtn.addEventListener("click", handleDelete);
  }

  init();
})();
