# ACJ Viajes — Landing Page (v1) Design

## Intent & Why

ACJ Viajes is a new travel agency with no existing web presence, no brand kit, no
photography, and no reviews or social proof. We have no access to the client — every
decision below is sourced from a client-completed questionnaire (`Formulario de
Enfoque al Cliente`) relayed by our point of contact, or is an explicit agency call
flagged as such.

The core job of v1 is trust, not transaction: a stranger with zero reason to believe
ACJ Viajes is real and competent needs to leave convinced it's a legitimate,
operational agency worth contacting. The site is intended, long-term, to be the
primary source of new clients — v1's only conversion goal is getting that visitor to
open a WhatsApp conversation.

## Goals

- Read as professional and operational to a visitor with no prior social proof.
- Present the three core services (circuitos terrestres, boletería nacional e
  internacional, hospedaje nacional e internacional) using the client's own
  problem/solution framing from the questionnaire.
- Carry the differentiation message clearly: a single dedicated advisor and a
  trip designed only for that client, versus fixed packages/mass-market agencies.
- Speak credibly to both the core local/regional audience (35–65, discretionary
  spend, values exclusivity) and the European long-haul segment (10–21 day,
  multi-destination trips booked months ahead, wants communication in their
  language, authenticity, small/private groups, responsible tourism).
- Drive every CTA to WhatsApp — no other conversion path in v1.
- Target the SEO phrase "agencia de viajes en Venezuela circuitos a medida"
  naturally in copy and metadata.

## Non-Goals (v1)

- No real booking or payment flow (flights, hotels, deposits) — deferred to a
  later phase, explicitly agreed with the client contact.
- No lead-capture form / backend — WhatsApp is the only contact path for v1.
- No multi-page site — one scrolling page, section-stacked.
- No French/German — language scope is an ES/EN toggle only, ES default
  (matches the SEO phrase as given).
- No CMS or admin panel.

## Anti-Goals (would make this a failure even if it "works")

- Reading as amateurish, generic, or templated — the explicit ask is professional
  and operational, since the site has to do the legitimacy work a track record
  would normally do.
- Reusing anything visual or verbal from Promar (`D:\AP\projects\promar_web`) or
  from the reference sites the client named (Sunsolhoteles.com, Lalianxaviajes.com).
  Promar is structural reference only — pacing/section rhythm of a one-page
  travel-agency site — never its navy/green/gold palette, Montserrat/Inter
  pairing, or any copy.
- Colloquial language anywhere in the copy — explicit client instruction.
- Implying a booking/payment capability that doesn't exist yet.

## Constraints

- No logo, no brand manual, no professional photography or video exists for
  ACJ Viajes. Visual identity, imagery strategy, and copy (beyond the client's
  provided paragraphs) are being made without client sign-off on nuance — flagged
  throughout as agency calls.
- WhatsApp number is not yet available; the CTA wiring must isolate it to a single
  swappable constant/placeholder so it can be dropped in later without touching
  layout or markup.
- We are not the client and have no way to check back on ambiguous nuance during
  this build — the questionnaire is the source of truth for anything it covers.

## Decided ("how it gets made")

These were discussed and chosen with the project contact, not assumed:

- **Stack:** static HTML/CSS/JS, Tailwind via CDN, vanilla CSS/JS for animation —
  explicitly chosen over this workspace's default premium stack (Next.js +
  Lenis/StringTune/anime.js/ShaderGradient) to stay close to Promar's fast,
  lightweight build speed. No framework, no build step required to view it.
- **Page structure:** one long scrolling page, Promar's section-pacing as the
  structural (not visual) reference: nav → hero → services (3) → why-ACJ /
  differentiation → audience trust signals → WhatsApp CTA → footer.
- **Conversion path:** WhatsApp only. No contact form, no backend.
- **Language:** ES/EN toggle, Spanish as default/primary (matches the SEO phrase
  verbatim), English as the secondary audience-facing version for the European
  segment. No other languages in v1.
- **Scope:** landing/lead-gen only; booking and payment flows are a future phase.

## What's Left to the Builder (agency calls, to be made during implementation)

- **Visual identity** (palette, type pairing, simple SVG wordmark/logo): new,
  not derived from Promar or either reference site, expressing the three brand
  adjectives the client gave — atenta, confiable, aventurera — within a
  non-colloquial, professional register.
- **Imagery strategy:** no photography exists, so sourcing needs to be decided
  (royalty-free travel stock, ideally Venezuela-recognizable locations such as
  Los Roques, Roraima, Canaima/Angel Falls, Mérida — or a tasteful
  illustration/texture treatment if suitable stock isn't available/legal to use).
- **Full bilingual copy:** Spanish copy leans on the client's own paragraphs
  (mission statement, three service descriptions, differentiation message)
  near-verbatim; English copy is a faithful, equally formal translation, not a
  loose rewrite.
- **Exact section layout and component design** within the agreed page structure.
- **SEO metadata** built around the given phrase.
- **Hosting/deployment:** new GitHub repo + Vercel project, consistent with
  this workspace's existing static-site projects (RRc-deploy, kimona-atelier-deck)
  — domain is a placeholder until the client has one.
- **WhatsApp CTA wiring:** implemented against a single placeholder number,
  structured so the real number drops in later with no other changes.

## Source Material

Full client questionnaire responses (mission, services, competitors,
differentiation, audience, SEO phrase, brand adjectives, reference sites,
explicit "no colloquial language" instruction) are preserved in the conversation
that produced this design and should be treated as the canonical content source
during copywriting.
