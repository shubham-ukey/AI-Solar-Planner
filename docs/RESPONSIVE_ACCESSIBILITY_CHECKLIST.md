# Responsive and Accessibility Manual Checklist

## Environment limitation

No browser automation, Playwright, or axe runner could be installed/run in this environment because npm dependency installation timed out. Therefore no viewport or WCAG conformance result is marked Pass. Use this checklist in Chrome/Edge after `npm run dev` or on the Vercel preview.

## Viewport matrix

Test these routes at 360px, 768px, and 1280px viewport widths:

- `/` Home
- `/planner` each of the five wizard steps
- `/results` after completing the planner
- `/shared` with valid and invalid hashes
- `/admin` login
- `/admin/leads` with filters/table/pagination
- `/admin/leads/<seed-id>` detail and delete dialog

For each route: inspect document width vs viewport; confirm no page-level horizontal scrollbar, no clipped text/buttons, tables scroll inside their own region, charts remain readable, and forms stay inside the viewport. A horizontally scrollable table inside its container is acceptable; horizontal page scrolling is not.

## Keyboard-only wizard walkthrough

1. Reload `/planner`; use Tab to reach the first field. Confirm the skip link appears on focus and reaches `#main-content`.
2. Use Tab/Shift+Tab to traverse controls in visual order; no focus is hidden behind sticky UI.
3. Enter invalid values and submit. Confirm each error is text-associated with its input and not conveyed by color alone.
4. Correct fields and advance through each wizard step using keyboard only.
5. Confirm focus remains visible after each step change and progress/current-step semantics are announced or discoverable.
6. Use Back and continue buttons without losing expected values.
7. On assumptions, modify one value and confirm the preview updates without a full page reload.
8. Finish to Results, tab through chart summaries/data tables, AI fallback controls, proposal controls and form fields.
9. Open the admin delete confirmation with keyboard; verify focus is trapped, Escape closes, and focus returns to the delete button.
10. Toggle language and verify the selected language is announced, persists after reload, and `document.documentElement.lang` changes.
11. Turn on OS/browser reduced motion and confirm non-essential animation is reduced.

## Contrast and axe checklist

- Run axe DevTools or `@axe-core/playwright` on every route listed above in both English and Hindi where applicable.
- Record critical/serious violations and fix them before claiming WCAG 2.1 AA.
- Measure text/background contrast, including muted text, buttons, error messages, chart labels and focus rings.
- Check 200% zoom, browser text scaling, visible focus, form labels/errors, heading order, dialog naming/focus trap, `aria-live` noise, and chart table alternatives.
- Verify color is never the only status cue.
- The project currently has chart descriptions plus corresponding data tables, global focus-visible styles, a skip link and reduced-motion CSS; these are code-level improvements, not a substitute for an axe/browser run.
