Here is a **short, clean Cursor prompt** you can **copy-paste directly**.
It only targets the **3 issues you mentioned**.

---

# CURSOR PATCH PROMPT (FINAL SMALL FIXES)

First **analyze the workspace** before making changes.
This is a **Rails backend + React (Vite) frontend project**.

Only implement the fixes below.
Do **not refactor anything else** and **do not break existing functionality**.

---

# 1 — Fix Home Page Hero Background (#home)

Problem:

The **hero background image is not visible** on:

```
http://localhost:3000/#home
```

The section exists but the background image is missing.

Fix:

Locate the section:

```
#home
```

Restore the **hero background image**.

Requirements:

* background must cover entire hero section
* maintain overlay gradient if present
* keep existing hero text
* ensure responsive behavior

Use proper CSS:

```
background-size: cover
background-position: center
background-repeat: no-repeat
min-height: 90vh
```

Do **not modify hero text or layout**, only restore the background image.

---

# 2 — Fix Leaflet Zoom Button Weird Shape

Problem:

The **+ / − zoom buttons** have a weird white square background and incorrect shape.

Cause:

Leaflet default `.leaflet-bar` styling is conflicting with custom CSS.

Fix:

Override Leaflet CSS completely.

Target:

```
.leaflet-control-zoom
.leaflet-control-zoom-in
.leaflet-control-zoom-out
```

Requirements:

Buttons must appear like:

```
[ + ]

[ − ]
```

Style requirements:

* rounded corners
* stacked vertically
* small gap between buttons
* no square container behind them
* subtle shadow

Ensure `.leaflet-bar` background and borders are removed.

---

# 3 — Improve Property Image Display (Aspect Ratio Handling)

Problem:

Property images have **different aspect ratios**:

* landscape
* portrait
* square

Currently the fixed container causes images to look **cropped or stretched**.

Solution:

Implement **adaptive image container**.

When rendering property images:

Detect image aspect ratio on load.

Adjust display style accordingly.

Rules:

If image is **landscape**

```
width: 100%
height: auto
```

If image is **portrait**

```
height: 100%
width: auto
```

If unknown ratio

```
object-fit: cover
```

Goal:

Images should **never appear distorted or cropped incorrectly**.

Use `onLoad` to detect:

```
naturalWidth
naturalHeight
```

Adjust container style dynamically.

---

# 4 — Do Not Modify Anything Else

Do not change:

* homepage layout
* admin dashboard
* booking flow
* site settings
* amenities icons
* navbar
* footer

Only implement the **three fixes above**.

---

# 5 — Verification Checklist

After implementing:

Confirm:

Home page:

* hero background visible
* responsive on mobile

Map:

* zoom buttons render correctly
* no white square artifacts

Property images:

* landscape images look natural
* portrait images fit properly
* no stretching or cropping

---

End of patch.
