# Cursor Prompt

I am attaching screenshots showing issues in the **calendar UI and booking form behavior**.

Before making any changes, **first analyze the entire frontend workspace and understand how the booking form and calendar components are currently implemented.**

Important rules:

* **Do not immediately modify files**
* **First inspect the project structure**
* Identify the **calendar component(s)** used in the application
* Identify where the booking form state is managed
* Identify how the **homestay selection and URL parameters** are handled

Only after understanding the current architecture should you apply the **minimal necessary changes**.

Do **not modify backend code**.

---

# Issues To Fix

## 1. Calendar Month / Year Scroll Selector

Screenshots show the current behavior.

Problems:

* Scrollable selector appears broken
* Scrollbar overlaps calendar grid
* Layout becomes misaligned
* Month/year selector appears incorrectly

Expected behavior:

When clicking **month or year in the calendar header**:

The calendar should **switch its content inside the same card** to a scrollable selector.

Important:

* The selector must appear **inside the same calendar card**
* It must **not appear as a floating overlay**
* It must **not render outside the card**
* It must **not overlap the calendar grid**
* It must **not use layered UI elements**

The card should **change content** from:

Calendar grid → Scrollable month/year list.

Selecting a value should return to the **calendar grid view**.

---

# 2. Year Selector Rules

Year selector must:

* Start from the **current year**
* Do not show past years
* Display years vertically
* Allow vertical scrolling
* Highlight selected year

---

# 3. Month Selector Rules

Month selector must:

* Display all months vertically
* Be scrollable
* Appear inside the same card
* Return to calendar grid after selection

---

# 4. Calendar Transparency Issue (Property Page)

On the **property details page** (`/properties/:slug`) the calendar appears **semi-transparent**.

This should not happen.

Expected behavior:

The calendar card should have a **solid background** and should not inherit transparency from parent containers.

---

# 5. Calendar Layout Overflow

On the property page reservation card:

* Calendar dropdown creates empty space on the right side
* Layout shifts incorrectly

Fix the layout so the calendar remains **properly contained inside the reservation card**.

---

# 6. Booking Form UI Overflow (Home Page)

On:

```
http://localhost:3000/#booking
```

The **Choose Homestay field** overflows when property titles are long.

Expected behavior:

* Property name must remain inside the input
* Long text should truncate visually
* UI layout must remain stable

---

# 7. "Book Now" Button Autofill

On the homestays listing page:

```
http://localhost:3000/#homestays
```

Each property card has a **Book Now button**.

When clicked:

The URL changes to:

```
http://localhost:3000/?homestay_id=1#booking
```

However the booking form does **not auto-select the property**.

Expected behavior:

When clicking **Book Now**:

1. Page scrolls to the booking section
2. Booking form automatically selects that property in the **Choose Homestay dropdown**

Important:

* The dropdown must still allow the user to change the property afterward
* The Book Now button should simply **pre-fill the property selection**

---

# 8. Maintain Existing Working Features

The following features are already working correctly and **must not break**:

* Blocked dates for booked properties
* Calendar date selection
* Booking submission
* Guest capacity logic
* Backend booking validations

---

# Implementation Rule

After analyzing the workspace:

* Reuse existing components where possible
* Do not introduce unnecessary components
* Do not refactor large sections of the codebase
* Only apply **minimal safe UI and state fixes**

---

# Goal

After fixes:

* Calendar month/year selector works correctly
* Selector appears inside the same card
* Calendar is not transparent
* Calendar layout does not overflow
* Booking form handles long titles properly
* Book Now button correctly auto-fills the property
* All existing booking functionality remains intact

---

If necessary, refactor the calendar component **only after understanding how it is currently used across pages**.

---

