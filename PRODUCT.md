# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Parents / guardians** — register their children for the camp online, on mobile, often distracted. They need a short, clear form ending in a QR code they can show at the door.
- **Camp staff / admins** — manage registrations, payment status, and live attendance from a dashboard during the event.
- **Door staff** — scan participant QR codes on an Android app to check attendees in.

## Product Purpose

TRAILBLAZE is registration and live check-in for a faith-based youth camp. Parents submit a child's details and payment status, receive a QR code, and staff scan that code at the venue to mark attendance. The dashboard reflects check-ins in real time.

## Positioning

Live QR check-in with real-time attendance. A staff scan at the door updates the admin dashboard instantly (via socket.io), so "who is here right now" is always current — not a static registration list.

## Operating Context

Faith-based youth camp in the Philippines. Philippine mobile numbers (`+63`/`09`) are required, and a Facebook Name field is required (Facebook is the region's primary social platform). Check-in happens at the venue door; staff use the Android scanner app pointed at the backend. Registration is public and rate-limited; the dashboard is admin-only.

## Capabilities and Constraints

- **Registration fields (all required, backend Zod-enforced):** name, nickname, birth date, email, contact number, Facebook name, home address, father name, father contact, mother name, mother contact. Optional: existing sickness/illness. Payment status `Paid`/`Not Paid` with an optional JPEG/PNG/WebP screenshot ≤ 5 MB.
- **Validation rules (must preserve):** PH mobile format; age 5–21; name fields without digits; sentence-casing on name/address/Facebook/parent fields.
- **Admin:** search, payment/attendance filters, pagination (10/page), bulk delete (≤ 500), Excel export, attendance toggle.
- **No real camp dates, cost, location, or description currently exist in the product** — future copy must not fabricate these.
- Android scanner app (`com.example.qrs`) shares the backend; out of scope for web design work.

## Brand Commitments

- Name: **TRAILBLAZE**. Faith-based youth camp; the trail/blaze/peak metaphor carries a spiritual-journey meaning and is a confirmed brand direction (blaze-orange accent, trail/elevation imagery, camp character).

## Evidence on Hand

None. No real camp imagery, dates, or pricing. Any illustrative imagery used in design work is synthetic and must be labeled as such.

## Product Principles

1. Registration must feel like an invitation to camp, not bureaucratic intake.
2. Live presence is the product's core value — "who is here right now" outranks list management.
3. Parents trust the system with their children's data and payment; every step must reassure, not alarm.
4. Staff at the door need fast, unambiguous scan-and-confirm feedback.

## Accessibility & Inclusion

No product-specific accessibility requirement was established; treat WCAG AA as the working bar (contrast, keyboard navigation, reduced motion, touch targets).
