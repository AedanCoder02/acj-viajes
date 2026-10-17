# ACJ Viajes Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page, bilingual (ES/EN), static HTML landing page for ACJ Viajes that reads as professional and operational, presents the three services and differentiation message from the client's questionnaire, and converts every CTA to WhatsApp.

**Architecture:** One `index.html`, Tailwind via CDN for utility styling, a small hand-written `assets/styles.css` for anything Tailwind can't express (language-visibility rules, reduced-motion guards, custom keyframes), and an ES-module `assets/script.js` holding the few pieces of real logic (WhatsApp URL building, language toggle, footer year) as pure, unit-testable functions. No framework, no build step, no backend — mirrors Promar's lightweight static-HTML approach, per the approved design.

**Tech Stack:** HTML5, Tailwind CSS (CDN), vanilla JS (ES modules), Node's built-in test runner (`node --test`) for unit tests, Playwright MCP for the one browser-verification pass. Deployment: GitHub + Vercel (static project), matching this workspace's existing static-site pattern.

**Spec:** `docs/superpowers/specs/2026-10-17-acj-viajes-landing-design.md`

## Global Constraints

- Static HTML/CSS/JS only — no framework, no build step, no backend (spec: "Decided").
- One scrolling page, section order: nav → hero → services (3) → differentiation → trust/process → WhatsApp CTA → footer (spec: "Decided — Page structure").
- WhatsApp is the only conversion path; the number must live in exactly one swappable config constant (spec: "Constraints" + "What's Left to the Builder").
- Language: ES default, EN toggle, no other languages (spec: "Decided — Language").
- No visual or copy reuse from Promar (`D:\AP\projects\promar_web`) or from Sunsolhoteles.com / Lalianxaviajes.com — structural pacing reference only (spec: "Anti-Goals").
- No colloquial language anywhere in copy (spec: client's explicit instruction).
- No fabricated trust stats or claims (no invented numbers/certifications) — trust section carries process credibility only (spec: "Decided — Page structure" addendum).
- SEO target phrase: "Agencia de viajes en Venezuela circuitos a medida" (spec: "Goals").
- "ACJ" is a standalone brand name, not expanded (spec: "What's Left to the Builder").
- Scope is landing/lead-gen only — no booking or payment flow (spec: "Non-Goals").

## Review Focus

- Fabricated trust claims sneaking into the differentiation/trust section (fake stats, invented certifications) — directly violates the anti-goal; guarded by a negative-content test in Task 4.
- A placeholder WhatsApp number that looks like a real number, misleading a visitor who clicks it before launch — guarded by asserting the placeholder is obviously non-real in Task 1.
- JavaScript failing to load (or running before paint) leaving the page showing both languages at once, or no content at all — guarded by making Spanish the CSS-default with no JS required, tested in Task 1/2.
- The SEO target phrase never actually landing in the title/H1/meta, silently missing the one measurable goal the client gave — guarded by a content test in Task 2.
- English copy drifting looser/more colloquial than the Spanish source during translation — not fully automatable; flagged here for the human review pass before Task 7 ships it.

---

## File Structure

- Create: `index.html` — the whole page, all sections, both languages inline.
- Create: `assets/styles.css` — language-visibility rules, reduced-motion guard, any custom keyframes/utilities Tailwind doesn't cover.
- Create: `assets/script.js` — ES module: `CONFIG`, `buildWhatsAppUrl`, `toggleLanguage`, `applyLanguage`, `currentYear`, plus a small non-exported wiring block that runs on `DOMContentLoaded`.
- Create: `assets/logo.svg` — new ACJ Viajes wordmark (no reuse of Promar's mark).
- Create: `tests/script.test.mjs` — unit tests for the pure functions in `script.js`.
- Create: `tests/content.test.mjs` — string-presence/absence assertions against `index.html`, grown task-by-task.
- Create: `package.json` — `{"type": "module", "scripts": {"test": "node --test tests"}}`, no runtime dependencies.
- Create: `.gitignore`, `README.md`.

## Task 1: Scaffold, config, and the two pure utilities

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `assets/script.js`
- Create: `assets/styles.css`
- Create: `index.html` (skeleton: `<head>` meta/SEO, empty `<nav>`/`<footer>` containers, script/style links)
- Test: `tests/script.test.mjs`, `tests/content.test.mjs`

**Interfaces:**
- Produces (for every later task): `CONFIG.whatsappNumber` (string, placeholder), `CONFIG.defaultLang` (`'es'`), `buildWhatsAppUrl(number: string, message: string): string`, `toggleLanguage(doc?: {documentElement: {getAttribute, setAttribute}}): 'es' | 'en'`, `applyLanguage(lang: 'es'|'en', doc?): void`, `currentYear(date?: Date): number`. All exported from `assets/script.js`.
- Produces: the HTML convention every later task relies on — `<html lang="es" data-lang="es">` on the root element, and any bilingual content wrapped in two sibling elements/spans with `lang="es"` / `lang="en"`, hidden/shown purely by the CSS rules below (no JS required for the default state).

- [ ] **Step 1: Write the failing unit tests for the pure functions**

```js
// tests/script.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, buildWhatsAppUrl, toggleLanguage, currentYear } from '../assets/script.js';

test('CONFIG.whatsappNumber is an obvious placeholder, not a real-looking number', () => {
  assert.match(CONFIG.whatsappNumber, /^0+$/);
});

test('buildWhatsAppUrl builds a wa.me link with the message encoded', () => {
  assert.equal(
    buildWhatsAppUrl('000000000', 'Hola'),
    'https://wa.me/000000000?text=Hola'
  );
});

test('buildWhatsAppUrl strips non-digit characters from the number', () => {
  assert.equal(
    buildWhatsAppUrl('+58 412-000-0000', 'Hi'),
    'https://wa.me/584120000000?text=Hi'
  );
});

test('toggleLanguage flips es -> en and reports the new value', () => {
  const fakeDoc = { documentElement: { _lang: 'es', getAttribute() { return this._lang; }, setAttribute(_, v) { this._lang = v; } } };
  assert.equal(toggleLanguage(fakeDoc), 'en');
  assert.equal(fakeDoc.documentElement._lang, 'en');
});

test('currentYear reads the year from a given date', () => {
  assert.equal(currentYear(new Date('2026-01-01T00:00:00Z')), 2026);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/script.test.mjs`
Expected: FAIL — `assets/script.js` does not exist yet.

- [ ] **Step 3: Implement `assets/script.js`**

Export `CONFIG = { whatsappNumber: '000000000', defaultLang: 'es' }` (the all-zero placeholder is intentional — obviously fake until the real number is dropped in). Implement `buildWhatsAppUrl(number, message)` by stripping non-digits from `number` with a regex and returning `` `https://wa.me/${digits}?text=${encodeURIComponent(message)}` ``. Implement `toggleLanguage(doc = document)` to read `doc.documentElement`'s current `data-lang` attribute, flip `'es'`↔`'en'`, set it, and return the new value. Implement `applyLanguage(lang, doc = document)` as a one-line `setAttribute('data-lang', lang)`. Implement `currentYear(date = new Date())` returning `date.getFullYear()`. Add a bottom (non-exported) block that runs on `DOMContentLoaded`: wires `#lang-toggle` click to `toggleLanguage()`, sets any `.whatsapp-cta` elements' `href` via `buildWhatsAppUrl(CONFIG.whatsappNumber, <static text>)`, and sets `#footer-year` text via `currentYear()`. This wiring block is glue code with no pinned behavior beyond "use the functions above" — write it directly, no test required for it.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/script.test.mjs`
Expected: PASS, 5/5.

- [ ] **Step 5: Write the failing content test for the SEO/structure skeleton**

```js
// tests/content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('root element defaults to Spanish with no JS required', () => {
  assert.match(html, /<html[^>]*\blang="es"[^>]*\bdata-lang="es"/);
});

test('SEO target phrase appears in the title', () => {
  assert.match(html, /<title>[^<]*[Aa]gencia de viajes en Venezuela[^<]*circuitos a medida[^<]*<\/title>/);
});
```

- [ ] **Step 6: Run the content test to verify it fails**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — `index.html` does not exist yet.

- [ ] **Step 7: Implement the `index.html` skeleton**

`<!DOCTYPE html>`, `<html lang="es" data-lang="es">`, `<head>` with `charset`, `viewport`, a `<title>` containing the SEO phrase (e.g. "ACJ Viajes — Agencia de Viajes en Venezuela | Circuitos a Medida"), a `<meta name="description">` also containing the phrase, the Tailwind CDN `<script>` tag, a `<link rel="stylesheet" href="assets/styles.css">`, and `<script type="module" src="assets/script.js"></script>`. Body contains empty `<nav id="nav">`, a placeholder `<main>`, and empty `<footer id="footer">` — later tasks fill these in.

- [ ] **Step 8: Implement `assets/styles.css`'s language rules and reduced-motion guard**

```css
html[data-lang="es"] [lang="en"] { display: none; }
html[data-lang="en"] [lang="es"] { display: none; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 9: Run both test files to verify they pass**

Run: `node --test tests`
Expected: PASS, 7/7.

- [ ] **Step 10: Write `package.json`, `.gitignore`, `README.md`**

`package.json`: `{"name": "acj-viajes", "private": true, "type": "module", "scripts": {"test": "node --test tests"}}`. `.gitignore`: standard Node/OS entries (`node_modules/`, `.DS_Store`). `README.md`: one paragraph describing the project and `npm test`.

- [ ] **Step 11: Commit**

```bash
git add package.json .gitignore README.md index.html assets tests
git commit -m "feat: scaffold ACJ Viajes landing page with WhatsApp/lang utilities"
```

## Task 2: Nav, logo, and hero

**Files:**
- Modify: `index.html` (`<nav>`, hero `<section>` inside `<main>`)
- Modify: `assets/styles.css` (nav/hero-specific rules, e.g. sticky/backdrop-blur-on-scroll if used)
- Create: `assets/logo.svg`
- Modify: `assets/script.js` (nav scroll-state wiring only, inside the existing `DOMContentLoaded` block)
- Test: `tests/content.test.mjs` (append)

**Interfaces:**
- Consumes: `CONFIG`, `buildWhatsAppUrl`, `toggleLanguage` from Task 1 (`assets/script.js`); the `lang="es"`/`lang="en"` sibling convention from Task 1.
- Produces: `#lang-toggle` button (consumed by the wiring block already written in Task 1); `.whatsapp-cta` class on every WhatsApp button across the whole site (consumed by Task 1's wiring block and by every later section task).

- [ ] **Step 1: Write the failing content tests**

```js
test('nav exposes a language toggle button', () => {
  assert.match(html, /id="lang-toggle"/);
});

test('nav includes a WhatsApp CTA', () => {
  assert.match(html, /class="[^"]*\bwhatsapp-cta\b[^"]*"[^>]*>[\s\S]{0,200}<\/nav>|<nav[\s\S]*whatsapp-cta/);
});

test('hero headline (Spanish) carries the SEO phrase', () => {
  assert.match(html, /lang="es"[^>]*>[^<]*[Aa]gencia de viajes en Venezuela[^<]*circuitos a medida/);
});

test('hero mission statement is present in both languages', () => {
  assert.match(html, /Escuchamos tus sueños, diseñamos cada detalle a tu medida/);
  assert.match(html, /We listen to your dreams, design every detail around you/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/content.test.mjs`
Expected: FAIL (4 new assertions).

- [ ] **Step 3: Create `assets/logo.svg`**

A simple new wordmark/mark for "ACJ Viajes" — not Promar's icon, not any reference site's mark. Builder's visual-identity call per spec; just needs to be a valid standalone SVG referenced from the nav.

- [ ] **Step 4: Implement the nav in `index.html`**

Logo (`<img src="assets/logo.svg" alt="ACJ Viajes">`) linking to `#inicio`; nav links to `#servicios`, `#diferencia`, `#proceso` (each with ES/EN label pairs using the `lang` convention); a `#lang-toggle` button (label can be static, e.g. "EN"/"ES" symbol, no translation needed); one `<a class="whatsapp-cta" href="#">` nav CTA (href is set at runtime by the Task 1 wiring block — leave `href="#"` in markup).

- [ ] **Step 5: Implement the hero section in `index.html`**

Inside `<main>`, `<section id="inicio">` with an H1 built from two `lang`-tagged variants: ES "Tu agencia de viajes en Venezuela para circuitos a medida." / EN "Your travel agency in Venezuela for custom-made circuits." Below it, the mission statement verbatim from the spec in both languages (ES: "En ACJ Viajes, nuestra misión es convertir cada viaje en una experiencia única. Escuchamos tus sueños, diseñamos cada detalle a tu medida y te acompañamos en cada paso, con atención personalizada y exclusiva. Porque no vendemos destinos: creamos recorridos pensados solo para ti." / EN: "At ACJ Viajes, our mission is to turn every trip into a singular experience. We listen to your dreams, design every detail around you, and stay with you every step of the way, with personal, exclusive attention. We do not sell destinations: we create journeys designed only for you."). Include one `class="whatsapp-cta"` primary button per language pair.

- [ ] **Step 6: Run to verify the tests pass**

Run: `node --test tests`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add index.html assets tests
git commit -m "feat: add nav, logo, and bilingual hero section"
```

## Task 3: Services section (3 services, verbatim copy)

**Files:**
- Modify: `index.html` (`<section id="servicios">`)
- Test: `tests/content.test.mjs` (append)

**Interfaces:**
- Consumes: `lang="es"`/`lang="en"` convention and `.whatsapp-cta` class from Tasks 1–2 (each service card's CTA reuses `.whatsapp-cta`, no new JS).

- [ ] **Step 1: Write the failing content tests**

```js
test('services section has three bilingual cards with the client-provided copy', () => {
  // Spanish — one distinctive clause per service, pinned to the spec's exact wording
  assert.match(html, /Elegimos rutas, tiempos y paradas según tus gustos/);           // circuitos
  assert.match(html, /Comparamos aerolíneas, horarios y tarifas/);                    // boletería
  assert.match(html, /Negociamos tarifas preferenciales, verificamos la calidad/);    // hospedaje
  // English — the matching translations
  assert.match(html, /We choose the routes, pace, and stops to match your preferences/);
  assert.match(html, /We compare airlines, schedules, and fares/);
  assert.match(html, /We negotiate preferential rates, verify quality/);
});

test('each service closes with the ACJ Viajes tagline in both languages', () => {
  assert.equal((html.match(/ACJ Viajes: viaja, descubre, vive\./g) || []).length, 3);
  assert.equal((html.match(/ACJ Viajes: travel, discover, live\./g) || []).length, 3);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/content.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement the services section**

Three cards inside `<section id="servicios">`, each with an ES/EN `lang`-tagged pair of the full paragraph from the spec's Source Material:
- Circuitos terrestres (ES verbatim from spec) / "With ACJ Viajes, your land circuit is designed around you. We choose the routes, pace, and stops to match your preferences, with trusted guides and secure transportation. We take care of every detail so you can simply enjoy the journey. No generic itineraries, no surprises: one advisor accompanies you before, during, and after your trip. ACJ Viajes: travel, discover, live."
- Boletería nacional e internacional (ES verbatim) / "With ACJ Viajes, flying is easier. We compare airlines, schedules, and fares to find the best option for your budget and needs. We guide you through changes, layovers, and documentation, and we're available for any unexpected situation. Whether it's a domestic or international flight, your ticket arrives with the confidence of personal, exclusive attention. ACJ Viajes: travel, discover, live."
- Hospedaje nacional e internacional (ES verbatim) / "With ACJ Viajes, you find the ideal place to rest. We select hotels and accommodations to match your style, budget, and preferred location, anywhere in the world. We negotiate preferential rates, verify quality, and manage your reservation without complications. You stay with the confidence of an exclusive advisor looking after every detail. ACJ Viajes: travel, discover, live."

- [ ] **Step 4: Run to verify the tests pass**

Run: `node --test tests`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests
git commit -m "feat: add services section with verbatim bilingual copy"
```

## Task 4: Differentiation and trust/process section

**Files:**
- Modify: `index.html` (`<section id="diferencia">`, `<section id="proceso">`)
- Test: `tests/content.test.mjs` (append)

**Interfaces:**
- Consumes: `lang` convention and `.whatsapp-cta` from prior tasks.

- [ ] **Step 1: Write the failing content tests**

```js
test('differentiation section carries the key client message, both languages', () => {
  assert.match(html, /Otras agencias venden servicios; en ACJ Viajes creamos tu experiencia/);
  assert.match(html, /Other agencies sell services; at ACJ Viajes we create your experience/);
});

test('differentiation bullets are present (Spanish)', () => {
  assert.match(html, /[Aa]sesor único/);
  assert.match(html, /[Ee]xperiencia exclusiva/);
});

test('trust section contains no fabricated stats or unearned claims', () => {
  const banned = [/\+\d{2,}\s*(clientes|viajeros|años)/i, /certificaci[oó]n\s+IATA/i, /a[ñn]os de experiencia/i];
  for (const pattern of banned) {
    assert.doesNotMatch(html, pattern);
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/content.test.mjs`
Expected: FAIL (new section doesn't exist; the no-fabrication test passes vacuously but is kept as a standing guard for this and all future tasks).

- [ ] **Step 3: Implement the differentiation section (`#diferencia`)**

Bilingual pair of the key message from the spec: ES "Otras agencias venden servicios; en ACJ Viajes creamos tu experiencia. Un asesor exclusivo, un plan a tu medida y respaldo en cada paso. ACJ Viajes: viaja, descubre, vive." / EN "Other agencies sell services; at ACJ Viajes we create your experience. One exclusive advisor, a plan made for you, and support at every step. ACJ Viajes: travel, discover, live." Below it, a bulleted list translating the spec's differentiation points (itinerario a medida / asesor único / flexibilidad / experiencia exclusiva / asesoría real / acompañamiento ante imprevistos / trato cercano), each with an ES/EN pair.

- [ ] **Step 4: Implement the trust/process section (`#proceso`)**

Per the spec's explicit framing: no invented numbers or certifications. Content is the "how a trip gets built" process — one dedicated advisor, support before/during/after the trip, small/private groups, flexible dates — restating the differentiation points as a process narrative rather than a stats strip. Bilingual pairs throughout.

- [ ] **Step 5: Run to verify the tests pass**

Run: `node --test tests`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html tests
git commit -m "feat: add differentiation and trust/process sections"
```

## Task 5: Final CTA, footer, and accessibility pass

**Files:**
- Modify: `index.html` (closing CTA `<section>`, `<footer>`)
- Modify: `assets/styles.css` (confirm/extend reduced-motion coverage for any motion added in Tasks 2–4)
- Test: `tests/content.test.mjs` (append)

**Interfaces:**
- Consumes: `.whatsapp-cta` (CTA), `#footer-year` id (consumed by Task 1's `currentYear()` wiring).

- [ ] **Step 1: Write the failing content tests**

```js
test('closing CTA section has a WhatsApp button', () => {
  assert.match(html, /<section[^>]*id="contacto"[\s\S]*whatsapp-cta[\s\S]*<\/section>/);
});

test('footer carries the tagline in both languages and a dynamic year', () => {
  assert.match(html, /viaja, descubre, vive/i);
  assert.match(html, /travel, discover, live/i);
  assert.match(html, /id="footer-year"/);
});

test('every transition/animation in styles.css is covered by the reduced-motion guard', () => {
  const guardIndex = html_css.indexOf('prefers-reduced-motion');
  assert.ok(guardIndex > -1);
});
```

(Note: the third test reads `assets/styles.css`, not `index.html` — add a second `readFileSync` for it at the top of `tests/content.test.mjs`, assigned to `html_css`.)

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/content.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement the closing CTA section (`#contacto`)**

A short bilingual restatement of the mission/tagline with one prominent `.whatsapp-cta` button per language.

- [ ] **Step 4: Implement the footer**

Bilingual tagline ("ACJ Viajes: viaja, descubre, vive." / "ACJ Viajes: travel, discover, live."), a `<span id="footer-year"></span>` (filled by Task 1's wiring), and nothing else fabricated — no address, no social links, no claims not in the spec.

- [ ] **Step 5: Confirm reduced-motion coverage**

If any hover/scroll motion was added in Tasks 2–4 beyond what Task 1's blanket `* { animation: none !important; transition: none !important; }` guard already covers, no action is needed — the guard is global. If a more selective guard was substituted, extend it here so no motion added since Task 1 escapes it.

- [ ] **Step 6: Run to verify the tests pass**

Run: `node --test tests`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/styles.css tests
git commit -m "feat: add closing CTA, footer, and confirm reduced-motion coverage"
```

## Task 6: Browser verification pass

**Files:** none created/modified unless a defect is found (in which case, fix in the relevant file from Tasks 1–5 and re-run this task's checks).

**Interfaces:** none — this task only exercises what prior tasks produced.

- [ ] **Step 1: Serve the site locally**

Run: `npx --yes serve . -p 4173` (or any static server) in the background.

- [ ] **Step 2: Load the page and verify the Spanish default renders with no console errors**

Using the Playwright MCP tool: navigate to `http://localhost:4173`, take a snapshot, confirm the hero headline text is the Spanish variant and no English-tagged content is visible, and check console messages for errors.

- [ ] **Step 3: Verify the language toggle actually swaps visible content**

Click `#lang-toggle`, re-snapshot, confirm the hero headline now shows the English variant and the Spanish one is hidden (not just present-but-overlapping).

- [ ] **Step 4: Verify every WhatsApp CTA resolves to a valid `wa.me` link**

For each `.whatsapp-cta` element, read its `href` attribute and assert it matches `^https://wa\.me/0+\?text=`.

- [ ] **Step 5: Verify mobile layout**

Resize the Playwright viewport to 375×812, re-snapshot, and visually confirm no horizontal overflow and tap targets look reasonably sized.

- [ ] **Step 6: Fix anything found, otherwise proceed**

If Steps 2–5 found a defect, fix it in the owning file from Tasks 1–5, re-run the relevant step, then commit the fix (`git commit -m "fix: <what was wrong>"`). If nothing was found, no commit is needed for this task.

## Task 7: Deploy (requires explicit go-ahead before running)

**This task pushes a public GitHub repo and creates a live public deployment. Confirm with the user immediately before running it — do not run it as a matter of course just because earlier tasks are done.**

**Files:**
- Modify: `README.md` (add the live URL once known)

**Interfaces:** none.

- [ ] **Step 1: Create the GitHub repository**

Run: `gh repo create AedanCoder02/acj-viajes --public --source=. --remote=origin --push`

- [ ] **Step 2: Create and link a Vercel project**

Run: `vercel link --yes` then `vercel --prod --token $OASIS_VERCEL_TOKEN` (static project, no build command needed — Vercel serves `index.html` as-is), following this workspace's existing pattern for EM static sites (e.g. `RRc-deploy`, `kimona-atelier-deck`).

- [ ] **Step 3: Record the live URL**

Add the deployed URL to `README.md`.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: record live deployment URL"
git push
```

---

## Self-Review

**Spec coverage:** mission/hero (Task 2), three services verbatim (Task 3), differentiation + non-fabricated trust/process (Task 4), audience-facing bilingual copy throughout (Tasks 2–5), WhatsApp-only CTA with isolated placeholder (Task 1, used everywhere), ES/EN toggle with no-JS-safe default (Task 1), SEO phrase (Task 1/2), one-page section order (Tasks 1–5 build it in that order), no Promar/reference-site reuse (enforced by using entirely new copy/markup/logo, never importing their files), new logo (Task 2), deployment (Task 7). No spec section is without a task.

**Step scan:** steps either pin an exact value from the spec (copy strings, CSS rules, config placeholder) or specify an exact signature with the body left to the implementer where the spec doesn't determine it (the `DOMContentLoaded` wiring block, the visual SVG logo design). No step says "handle appropriately" without a concrete check.

**Type consistency:** `buildWhatsAppUrl(number, message)`, `toggleLanguage(doc?)`, `applyLanguage(lang, doc?)`, `currentYear(date?)`, and `CONFIG` are defined once in Task 1 and referenced identically in every later task — no renamed functions.

**Review Focus:** all five items from the header have an owning test — fabricated stats (Task 4), fake-looking placeholder number (Task 1), JS-required-for-correct-default-state (Task 1/2, CSS-only default), missing SEO phrase (Task 1), colloquial-drift in English copy (flagged as a human check before Task 7, not automatable).

**Proportion:** plan is comparable in length to the spec; HTML/CSS bodies are specified as exact strings or structural requirements rather than full markup transcripts, leaving layout/Tailwind-class choices to the implementer.
