# Splitano — Website Build Specification

## 1. What we're building

Splitano is a bill-splitting fintech product: users upload any bill (electricity, internet, rent, phone, etc.), Splitano pays the biller instantly, and the user repays Splitano in 4 interest-free installments over time. This is the same business model as **Deferit** (https://deferit.com) — use that site purely as a *reference for information architecture and user flow*, not for copying layout, text, or visual design. Everything you build must be original.

Build a full, production-quality **marketing website** (not the logged-in app) — the public-facing site that explains the product, builds trust, and converts visitors into signups.

Treat this like you're the senior product engineer who designed Splitano from scratch. Don't build a generic template with the copy swapped — build something that feels like it was actually designed for a bill-splitting product used by real people managing real bills. Every section should earn its place on the page.

---

## 2. Tech stack & constraints

- **HTML5** — one static `.html` file per page (no SPA routing, no client-side framework)
- **Tailwind CSS via CDN** (`<script src="https://cdn.tailwindcss.com"></script>`) — no build step
- **Vanilla JavaScript** — for interactivity (mobile nav toggle, FAQ accordions, tab switches, form validation UI, etc.). No jQuery, no frameworks.
- **Fully responsive** — mobile-first, must look intentional (not just "doesn't break") at 375px, 768px, 1024px, and 1440px+ widths
- **Accessible** — semantic HTML5 tags, proper heading hierarchy (one `<h1>` per page), alt text on all images, visible focus states, sufficient color contrast, keyboard-navigable nav and accordions
- **SEO-ready** — unique `<title>` and meta description per page, Open Graph tags, semantic structure, descriptive alt text

### Important — this becomes a Django app later

This static site will later be ported into a Python/Django web app. Build it now so that migration is painless:

- **Keep the header and footer markup byte-for-byte identical across every page.** These will later become `base.html` with `{% block %}` sections — any drift between pages now means manual reconciliation later.
- **Use relative paths for all internal links and assets** (`about.html`, `css/style.css`, `img/logo.svg`) — never absolute paths like `/about` or hardcoded domains. Django's `{% url %}` and `{% static %}` will replace these later, but relative paths make that swap mechanical instead of a rewrite.
- **No inline `<style>` blocks or one-off inline styles** — everything through Tailwind utility classes in the HTML, or a single shared `css/custom.css` for the few things Tailwind can't express (custom animations, font-face). Django template inheritance works cleanly with one shared stylesheet; scattered inline styles don't.
- **Forms should have correct `<form>` structure, `name` attributes on every input, and `method="post"`** even though there's no backend yet — this is exactly the shape Django's form rendering expects, so wiring it up later means adding `{% csrf_token % }` and connecting a view, not rebuilding the form.
- **Don't use any JS that manipulates routing or history (no `pushState`, no hash-routing).** Every page is a real, separate HTML file reachable by its own URL — this maps 1:1 to Django URL patterns later.
- **Componentize repeated UI blocks mentally, even though there's no template engine yet** — e.g. the "how it works" 3-step block, testimonial cards, FAQ items should each be structured as a clean, copy-pasteable, self-contained chunk of markup so they can become Django `{% include %}` partials later with minimal editing.

---

## 3. Brand identity

**Name:** Splitano
**Tagline direction:** something that communicates "pay it now, split it later" — write 2-3 original tagline options and pick the strongest for the hero.

**Color palette — "Trust Blue":**

| Role | Hex | Usage |
|---|---|---|
| Primary (Deep Navy) | `#0B2A4A` | Header, footer, dark section backgrounds, primary headings |
| Secondary (Sky Blue) | `#1E6FEB` | Primary buttons, links, active states, icons |
| Light Tint (Pale Blue) | `#EAF2FF` | Light section backgrounds, cards, form field backgrounds |
| Accent (Warm Yellow) | `#FFC94A` | Sparingly — key CTA buttons, badges, highlight underlines. Never as a large background fill. |
| Neutral White | `#FFFFFF` | Base background, text on dark |
| Card Fill (Navy panel) | `#123A63` | Secondary panels sitting on navy backgrounds |
| Body text (light mode) | `#1F2937` | Standard paragraph text on white/pale backgrounds |
| Muted text | `#6B7280` | Secondary/supporting text |

Register these as Tailwind config extensions at the top of every page (since we're on the CDN build, use the inline config script):

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          navy: '#0B2A4A',
          skyblue: '#1E6FEB',
          paleblue: '#EAF2FF',
          gold: '#FFC94A',
          cardnavy: '#123A63',
        }
      }
    }
  }
</script>
```

**Typography:** Use a clean, modern sans-serif from Google Fonts (e.g. Inter or Plus Jakarta Sans) loaded via `<link>`. Bold, confident headings (font-weight 700-800); comfortable, readable body text (16-18px base, 1.6 line-height).

**Visual tone:** Calm, trustworthy, modern fintech — never cluttered, generous white space, soft rounded corners (rounded-xl / rounded-2xl on cards and buttons), subtle shadows rather than hard borders, no stock-photo cheesiness.

---

## 4. Global components (identical on every page)

### Header / Navigation
- Logo "Splitano" (styled as text logo — navy wordmark, or navy + gold accent dot)
- Nav links: How It Works, Credit Builder, Bill Savings, About Us, Business
- Right side: "Log In" (text link) + "Get Started" (solid gold or skyblue button)
- Sticky on scroll, background transitions from transparent/white to solid with shadow on scroll
- Mobile: hamburger menu opening a full-screen or slide-in nav drawer, with smooth open/close animation and proper `aria-expanded` handling

### Footer
- 4-column layout on desktop (collapses to stacked accordion-style or single column on mobile):
  - Column 1: Splitano logo + short mission statement + social icons (placeholder links)
  - Column 2: Product (How It Works, Credit Builder, Bill Savings)
  - Column 3: Company (About Us, Business, Contact, Careers)
  - Column 4: Legal (Terms of Service, Privacy Policy)
- Bottom bar: © 2026 Splitano. All rights reserved. + small disclaimer line (write an original one appropriate for a BNPL bill-payment product, e.g. noting Splitano is not a bank)
- Navy background, white/pale-blue text

---

## 5. Pages to build

Build all of the following as separate HTML files. For each, write original, product-appropriate copy — don't leave lorem ipsum, and don't copy Deferit's actual sentences.

### 1. `index.html` — Home
- **Hero**: strong headline + subheadline explaining the core value prop, primary CTA button, supporting visual (can be an illustrated/abstract SVG composition or a stylized mock UI card — no fake stock photos of "happy people with bills")
- **Trust bar**: small strip with logos/badges implying scale or credibility (e.g. "10,000+ bills split", "4.8/5 rated") — clearly placeholder stat, styled cleanly
- **How it works** (3-4 step visual sequence: Upload your bill → We pay it instantly → Repay in 4 installments → Bill sorted)
- **Bill categories supported** (grid of icons: Electricity, Internet, Phone, Rent, Water, Insurance, etc.)
- **Why Splitano** (3-column benefit cards: No interest, No credit check impact*, Instant payment)
- **Testimonials** (3 cards, placeholder names/quotes clearly written as realistic but original)
- **FAQ accordion** (5-6 common questions, JS-powered expand/collapse)
- **Final CTA band** (bold navy section, "Ready to breathe easier?" + Get Started button)

### 2. `how-it-works.html`
- Detailed breakdown of the 4-step process with more depth than the homepage summary, visuals/numbered sections, a short embedded FAQ specific to the process, and a CTA

### 3. `credit-builder.html`
- Explain a "Credit Builder" feature/product tier (mirroring Deferit's positioning of helping users build credit history through on-time repayments) — explain how it works, benefits, eligibility notes, CTA

### 4. `bill-savings.html`
- A feature page about helping users save on recurring bills (e.g. comparison/negotiation angle) — explain the concept, benefits, how to get started, CTA

### 5. `about.html`
- Company mission/story (original narrative — why Splitano exists, the problem it solves), values section, small "team" or "by the numbers" section, CTA

### 6. `business.html`
- A page aimed at billers/merchants who might want to accept Splitano as a payment method — value prop for businesses, how it works for them, contact/signup CTA

### 7. `contact.html`
- Contact form (Name, Email, Subject, Message — proper form structure per Section 2), plus support contact info block, FAQ shortcut, and social links

### 8. `terms.html`
- Terms of Service — structured with proper headings, original placeholder legal-style content clearly organized into sections (Acceptance of Terms, Use of Service, Payments & Fees, Limitation of Liability, etc.) — doesn't need to be legally binding real text, just properly structured and readable

### 9. `privacy.html`
- Privacy Policy — same treatment as Terms: structured sections (Information We Collect, How We Use It, Data Sharing, Your Rights, Cookies, Contact), clean and readable

---

## 6. JavaScript behavior required

- Mobile nav open/close toggle
- FAQ accordion expand/collapse (on home + how-it-works pages)
- Sticky header scroll behavior
- Contact form: client-side validation (required fields, valid email format) with inline error messages — no actual submission logic since there's no backend yet, but structure the JS so a `fetch()` POST call can be dropped in later with minimal changes
- Smooth scroll for any in-page anchor links

---

## 7. File/folder structure

```
splitano/
├── index.html
├── how-it-works.html
├── credit-builder.html
├── bill-savings.html
├── about.html
├── business.html
├── contact.html
├── terms.html
├── privacy.html
├── css/
│   └── custom.css        (only for what Tailwind utilities can't express)
├── js/
│   └── main.js            (all interactivity, shared across pages)
└── img/
    └── (logo, icons, illustrations — SVGs preferred over raster where possible)
```

---

## 8. Definition of done

- All 9 pages built, fully responsive, visually consistent
- Header/footer identical across every page
- No lorem ipsum, no broken links, no console errors
- Lighthouse-reasonable: fast load (CDN Tailwind + minimal JS), no layout shift, accessible color contrast
- Everything above about Django-readiness (relative paths, form structure, no client routing, componentized markup) followed throughout
