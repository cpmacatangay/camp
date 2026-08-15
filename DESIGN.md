# Design — TRAILBLAZE

<!-- impeccable:design-schema 1 -->

## World

**Trail to the summit.** A faith-based youth camp rendered as a journey: registration is a trail of checkpoints, arrival is the peak. The visual language is a trail-marker ("blaze") system applied to a warm, evergreen ground.

## Color

Defined as Tailwind v4 `@theme` tokens in `web/src/index.css`.

- **Pine** (`pine-50`…`pine-950`, deep evergreen) — structure and identity: primary actions, headers, wordmark, links, success.
- **Blaze** (`blaze-50`…`blaze-900`, orange) — the trail-marker accent: active/progress states, the logo's mountain, the submit CTA, "present"/live states.
- **Trail** (`trail-50`…`trail-300`, warm paper) — the page ground, replacing the old cool `gray-50`.
- Semantic colors (success green, warning amber, error red) are used only where they carry meaning (toasts, badges, validation).

## Type

- **Sora** (700/800, self-hosted in `web/public/fonts/`) — display face: wordmark, page titles, section headings. `--font-display`.
- **Inter** (`Inter var` via rsms.me) — body/UI: forms, tables, dense admin text. `--font-sans`.

## Components & Motifs

- **Logo** (`web/src/components/Logo.jsx`): a rounded pine badge holding a blaze-orange mountain ridge with a summit dot. Wordmark set in Sora 800, tight tracking, title case.
- **Step indicator** (registration): three trail checkpoints — done (pine fill + check), active (blaze ring), pending (gray); joined by a thin trail line.
- **Attendance bar** (dashboard): a pine→blaze gradient fill, the "elevation to the peak" of live presence.
- **Form fields**: shared `TextField` / `TextAreaField` / `DateField` / `PaymentSection` / `ParentsFieldset`; pine focus rings; `showBadge` prop hides the per-field "Required" pill when a single legend is used instead.

## Motion

- New-attendance flash (`flash-green`) and skeletons (`animate-pulse`) are the only animation; both gated behind `prefers-reduced-motion` in `index.css`.
- Transitions are color/opacity only (`transition-colors`, `transition-[width]`), no transform-based motion.
