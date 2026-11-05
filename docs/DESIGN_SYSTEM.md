# Appointment Prep — Design System Specification

**Version:** 2.0 (Phase 7 & Loop 3B)  
**Status:** Living Design System  
**Theme:** Calm Forest Health & Organic Neutrals  

---

## 1. Principles & Design Philosophy

1. **Calm Clarity:** Healthcare visits are often fraught with anxiety. Every surface, contrast, and font size must convey stillness, clarity, and competence.
2. **Strict Color Discipline:** **No purple, violet, or indigo.** The primary brand hue is an organic forest green (`#2F6B50`) paired with warm neutrals.
3. **Accessibility First (WCAG 2.2 AA):** Strict minimum 4.5:1 text-to-background contrast, distinct focus-visible rings for keyboard navigators, and generous tap targets.
4. **Physical World Parity:** Web screens and physical printouts must have a 1:1 conceptual relationship. Checklists print cleanly without toner waste or clipped tables.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Core Neutral Palette

| Token | Hex Value | Purpose / Usage |
|---|---|---|
| `app` | `#F7F8F5` | Base page canvas background; warm off-white that reduces eye fatigue. |
| `surface` | `#FFFFFF` | Elevated cards, dialogs, inputs, and container surfaces. |
| `main-text` | `#1D2922` | Primary headlines, labels, and body text. High contrast (12.8:1). |
| `secondary-text` | `#657168` | Supporting metadata, timestamps, helper text, and placeholders. |
| `border` | `#E2E8E2` | Hairline dividers, card outlines, and component borders. |

### 2.2 Brand & Interactive Tokens (Forest Green)

| Token | Hex Value | Purpose / Usage |
|---|---|---|
| `primary` | `#2F6B50` | Primary buttons, brand mark, active nav, focus rings, and checklist headers. |
| `primary-hover` | `#25553F` | Darkened state on button hover/active interaction. |
| `primary-soft` | `#E8F1EA` | Soft pill backgrounds, badge surfaces, and active tab highlights. |

### 2.3 Semantic Feedback Tokens

| Token | Hex Value | Soft Background | Border | Purpose |
|---|---|---|---|---|
| `error` | `#B42318` | `#FDF2F2` (`error-soft`) | `#F8D7DA` | Form validation failures, critical alerts, cancel status |
| `warning` | `#9A6700` | `#FDF6E8` (`warning-soft`) | `#E8D2A4` | Upcoming due dates, follow-up deadlines |
| `success` | `#287A4B` | `#EDF7EE` (`success-soft`) | `#C8E6C9` | Completed actions, asked questions, success toasts |

> [!CAUTION]
> **Prohibited Colors:** Purple (`#7C3AED`, `#8B5CF6`, `#A855F7`), Violet, and Indigo are strictly prohibited in this codebase.

---

## 3. Typography Hierarchy

The system uses **Inter** as its primary typeface, falling back to modern system fonts:
`'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

| Style | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| Display | 28px–32px | Extrabold (800) | Tight (`-0.025em`) | Page title (Appointments, Checklist header) |
| Heading 1 | 24px | Bold (700) | Tight (`-0.02em`) | Modal title, Appointment hero |
| Heading 2 | 18px–20px | Bold (700) | Normal | Section headings (Questions, Medications) |
| Heading 3 | 14px–16px | Semibold (600) | Normal | Card titles, Item titles |
| Body | 14px | Normal (400) | Normal | Main paragraphs, inputs, checklist items |
| Caption / Metadata | 12px | Medium (500) | Normal | Dates, locations, dosage labels, helper notes |
| Disclaimer | 10px–11px | Normal (400) | Normal | Legal non-clinical guidance notice |

---

## 4. Spacing, Radius, and Elevation

### 4.1 Spacing Scale
Built on the standard 4px Tailwind grid:
- `space-1`: 4px (micro spacing between icon and text)
- `space-2`: 8px (button internal spacing, chip gap)
- `space-3`: 12px (form input vertical gap)
- `space-4`: 16px (card inner padding on mobile)
- `space-6`: 24px (section margins, card inner padding on desktop)
- `space-8`: 32px (container gap, page margins)

### 4.2 Border Radius
- `rounded-lg` (8px): Action pills, small icon boxes.
- `rounded-xl` (12px): Standard form inputs, buttons, checklist items.
- `rounded-2xl` (16px): Content cards, modal dialogs, hero banners.
- `rounded-full` (9999px): Status pills, user avatar circle.

### 4.3 Elevation & Shadows
- Flat cards: `border border-border bg-white shadow-sm`
- Elevated modals: `border border-border bg-white shadow-xl`
- Interactive hover: `hover:border-primary/40 hover:shadow-md transition-all`

---

## 5. Components & Interaction Guidelines

### 5.1 Primary Buttons
```tsx
<button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary">
  {children}
</button>
```

### 5.2 Form Inputs
```tsx
<input className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white text-main-text placeholder-secondary-text/60" />
```

### 5.3 Status Pills
```tsx
// Upcoming
<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary-soft text-primary">Upcoming</span>
// Completed
<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-border bg-neutral-100 text-secondary-text">Completed</span>
// Cancelled
<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-error-border bg-error-soft text-error">Cancelled</span>
```

---

## 6. Print Stylesheet Specification (`@media print`)

```css
@media print {
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
    font-size: 11pt !important;
  }
  .no-print {
    display: none !important;
  }
  .print-container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

---

## 7. Tailwind Configuration Reference

```javascript
// client/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#F7F8F5',
        surface: '#FFFFFF',
        'main-text': '#1D2922',
        'secondary-text': '#657168',
        border: '#E2E8E2',
        primary: '#2F6B50',
        'primary-hover': '#25553F',
        'primary-soft': '#E8F1EA',
        error: '#B42318',
        'error-soft': '#FDF2F2',
        'error-border': '#F8D7DA',
        warning: '#9A6700',
        'warning-soft': '#FDF6E8',
        'warning-border': '#E8D2A4',
        success: '#287A4B',
        'success-soft': '#EDF7EE',
        'success-border': '#C8E6C9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
};
```

