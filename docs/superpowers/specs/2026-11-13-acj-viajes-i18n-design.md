# ACJ Viajes — 9-language rollout

## Intent & why
Aedan wants the site to show each visitor their own language automatically — no dropdown required to get it right — extended from the current ES/EN toggle to 9 languages: English, Spanish (LatAm), Portuguese (Brazil), Portuguese (Portugal), French, Italian, German, Japanese, and Simplified Chinese.

## Goals
- Detect the visitor's language from their browser and render that language on load, with no flash of the wrong language if avoidable.
- Keep a manual override available (a dropdown, since 9 options no longer fit a 2-state toggle button), and remember an explicit choice across visits.
- Stay a static site: no bundler, no npm build step, no translation-management tooling or library. Deploy stays "push to master, GitHub Pages serves it directly."
- Scale cleanly to all existing bilingual content: 131 text blocks in `index.html`, plus 71 more across the three legal pages (`privacidad.html`, `terminos.html`, `cookies.html`).

## Non-goals
- No per-language URLs (`/en/`, `/es/`) — this only changes what text renders, not routing. Can be added later if wanted.
- No IP/geo-based detection — browser language preference is the only signal (Aedan confirmed: no backend, nothing fancy).
- No CMS or external translation service integration.

## Anti-goals
Even if it "works," this fails if:
- The page gets noticeably heavier from shipping 9 copies of every string (literal `<span lang="xx">` duplication would roughly triple `index.html`'s size).
- A future one-line copy edit means touching 9 different places in the HTML.
- A legal page carries an unreviewed machine translation presented as if it were authoritative, with no flag that it needs review.

## Constraints
- Static GitHub Pages hosting, no backend, no server-side rendering.
- Keep the existing design system (Tailwind CDN, forest/amber palette) and the existing test conventions (`content.test.mjs` reads the raw HTML/CSS, `script.test.mjs` tests `assets/script.js`) — tests get updated, not dropped. `npm test` stays the one verification command.

## Approaches considered
1. **Literal extension of the current pattern** — keep two `<span lang="xx">` siblings per string, just add 7 more per block. Simplest to describe, matches "don't change what's already there" literally, but index.html alone would grow from ~430 to 1,300+ lines, and every copy edit touches 9 spots instead of 2.
2. **Dictionary-driven, single node per element (chosen)** — one element, one `data-i18n="key"` attribute, and a plain JS object (`assets/i18n.js`, no library, no build step) holding all 9 translations per key. `assets/script.js` detects the language and swaps `textContent` from the dictionary. Still zero frameworks — just a JS object literal instead of duplicated markup.

Aedan picked option 2 (2026-11-13, "lets do number 2").

## The how (decided + left to the builder)
- **Detection**: `navigator.languages`, matched against the 9 supported codes; closest-match fallback (e.g. `pt-AO` → `pt-PT`, anything unmatched → `es`, the site's base language). Runs from an inline pre-paint `<script>` in `<head>` (same technique as the CAIDE marketing site) so there's no flash of the wrong language before the dictionary applies.
- **Manual override**: the current `#lang-toggle` button becomes a small dropdown listing all 9 languages, styled to match the existing nav. Picking one re-renders via the same function and is saved to `localStorage`; a stored choice always wins over auto-detection on later visits.
- **Key naming**: dot-namespaced by section (e.g. `hero.title`, `services.circuitos.body`, `legal.privacidad.sectionX`) — builder's call, not asked back.
- Elements whose string legitimately contains inline markup (e.g. the cookie notice's embedded `<a>`) use a dictionary value containing that markup and get set via `innerHTML`, not `textContent`; everything else uses `textContent` to avoid HTML injection from the dictionary.

## Open question (Aedan's call, not yet answered)
**Who reviews the translated strings before this ships** — especially `terminos.html` and `privacidad.html`, which are legal documents, not marketing copy? I'll draft all 9 languages, but I'm not a certified translator, and a bad legal-page translation is a liability, not just an awkward sentence.

Proposed default, pending his answer: translate everything now (nothing is public until the PR merges), but hold the PR for his explicit sign-off on the two legal pages specifically before merging — the marketing pages (index.html) can ship once the usual tests pass, same as any other change.
