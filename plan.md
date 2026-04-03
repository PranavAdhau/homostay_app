# PATCH PROMPT (FINAL SMALL FIX)

Analyze the workspace before making changes.
This is a **Rails backend + React (Vite) frontend project**.

Only apply the fixes below.
**Do not refactor or modify unrelated components.**

---

# 1 — Fix Map Overlapping Navbar When Scrolling

Current issue:

The **Leaflet map overlaps the navbar when scrolling**, as shown in the screenshot.

Cause:

Leaflet map container and controls have a **higher z-index than the navbar**.

Fix:

Locate the map container styling and Leaflet controls.

Ensure the navbar always stays above the map.

Apply proper z-index hierarchy.

Required rules:

Navbar:

```
z-index: 1000
position: sticky or fixed
```

Leaflet map container:

```
z-index: 1
```

Leaflet controls:

```
z-index: 2
```

Also ensure:

```
.leaflet-container
.leaflet-control-container
```

do not override navbar stacking.

Goal:

When scrolling the page:

- Navbar stays above everything
- Map never overlaps navbar
- Map still remains interactive

---

# 2 — Revert Property Image Aspect Ratio Logic

Previously an instruction was given to implement **dynamic aspect ratio detection** for property images.

Revert this change completely.

Restore the **previous image rendering logic exactly as it was before**.

Remove:

- `onLoad` image detection
- aspect ratio calculations
- dynamic container resizing

Restore previous behavior where property images render using the original styling.

Do not modify:

- property image component
- property gallery layout
- card styling

Just revert the aspect ratio patch.

---

# 3 — Do Not Modify Anything Else

Do NOT change:

- homepage
- map styling
- amenities icons
- admin dashboard
- booking system
- site settings
- navbar layout
- hero section
- property cards

Only implement:

1. Navbar overlap fix
2. Revert image aspect ratio logic

---

# 4 — Verification

After applying the patch confirm:

Navbar:

- always stays above map
- no overlap when scrolling

Property images:

- display exactly as before
- no dynamic resizing

---

End of patch.
