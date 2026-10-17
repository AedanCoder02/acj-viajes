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
- Substitute for the social proof the agency doesn't have yet (no reviews, no
  track record on the open web) with *process* credibility — see "audience
  trust signals" below.
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
  **Agency call on the trust-signals section:** since there are no reviews, no
  certifications, and no track record to cite yet, this section must not
  fabricate stats or claims (no invented "+500 clientes" style numbers — that
  would violate the anti-goal on implying capability that doesn't exist).
  Instead it carries *process* credibility: how a trip actually gets built
  (single advisor, before/during/after support, small/private groups), i.e.
  the differentiation copy the client already wrote, not manufactured social
  proof.
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
- **Brand name treatment:** nothing in the questionnaire expands "ACJ" into
  words, and there's no one to ask. Treated as a standalone brand name (common
  in the travel-agency category), not spelled out or guessed at — agency call.

## Source Material (verbatim, canonical for copywriting)

**Mission / 30-second pitch:**
> "En ACJ Viajes, nuestra misión es convertir cada viaje en una experiencia
> única. Escuchamos tus sueños, diseñamos cada detalle a tu medida y te
> acompañamos en cada paso, con atención personalizada y exclusiva. Porque no
> vendemos destinos: creamos recorridos pensados solo para ti."

**Service 1 — Circuitos terrestres:**
> "Con ACJ Viajes, tu circuito terrestre se diseña a tu medida. Elegimos
> rutas, tiempos y paradas según tus gustos, con guías de confianza y
> transporte seguro. Cuidamos cada detalle para que solo te dediques a
> disfrutar. Sin itinerarios genéricos ni sorpresas: un asesor te acompaña
> antes, durante y después del viaje. ACJ Viajes: viaja, descubre, vive."

**Service 2 — Boletería nacional e internacional:**
> "Con ACJ Viajes, volar es más fácil. Comparamos aerolíneas, horarios y
> tarifas para encontrar la mejor opción según tu presupuesto y necesidades.
> Te asesoramos en cambios, escalas y documentación, y estamos disponibles
> ante cualquier imprevisto. Ya sea un vuelo nacional o internacional, tu
> boleto llega con la tranquilidad de una atención personal y exclusiva. ACJ
> Viajes: viaja, descubre, vive."

**Service 3 — Hospedaje nacional e internacional:**
> "Con ACJ Viajes, encuentras el lugar ideal para descansar. Seleccionamos
> hoteles y alojamientos según tu estilo, presupuesto y ubicación deseada, en
> cualquier destino, nacional o internacional. Negociamos tarifas
> preferenciales, verificamos la calidad y gestionamos tu reserva sin
> complicaciones. Te hospedas con la confianza de contar con un asesor
> exclusivo que cuida cada detalle. ACJ Viajes: viaja, descubre, vive."

**Differentiation vs. competitors (Hover Tours — circuitos; Viajes Índigo —
boletería y hospedaje):**
- Itinerario a medida: el cliente decide rutas, ritmo y paradas, no elige
  entre salidas y paquetes fijos.
- Asesor único: una sola persona lo acompaña antes, durante y después del
  viaje.
- Flexibilidad: fechas, grupos pequeños, preferencias especiales.
- Experiencia exclusiva, no compartida con un grupo masivo.
- Asesoría real, no solo venta: se compara y recomienda, no solo se emite.
- Acompañamiento ante imprevistos (cambios, cancelaciones, retrasos).
- Trato cercano: el cliente es reconocido por nombre e historial.

**Key client-facing message:**
> "Otras agencias venden servicios; en ACJ Viajes creamos tu experiencia. Un
> asesor exclusivo, un plan a tu medida y respaldo en cada paso. ACJ Viajes:
> viaja, descubre, vive."

**Target audience:**
- Core: 35–65 years old (sub-segments 35–55 parejas/familias con poder
  adquisitivo; 55–70 viajeros con tiempo y presupuesto; 25–35 viajeros
  jóvenes/aventureros).
- Significant European segment: 10–21 day trips, booked months ahead, often
  multi-destination, arrive wanting everything resolved from the airport —
  circuito terrestre is the natural fit for them.
- What they look for: autenticidad (cultura local, gastronomía, naturaleza,
  lejos del turismo masivo), seguridad y confianza (transporte confiable,
  guías certificados, respaldo ante imprevistos), comunicación clara
  (respuesta rápida, itinerario detallado, precios transparentes, idioma
  propio cuando es posible), personalización real (rutas flexibles, grupos
  pequeños o privados), turismo responsable, buen valor (no necesariamente lo
  más barato, sino la mejor relación calidad-precio).

**SEO phrase (target):** "Agencia de viajes en Venezuela circuitos a medida"

**Brand personality (client's own words):** Atenta (escucha antes de
proponer, recuerda los detalles de cada cliente), Confiable (cumple lo
prometido, presente ante imprevistos), Aventurera (conoce el destino a fondo,
disfruta compartir lo auténtico de cada lugar).

**Explicit instruction:** no lenguaje coloquial, anywhere.

**Reference sites named by the client** (structural/quality benchmarks only —
not visual sources): Sunsolhoteles.com, Lalianxaviajes.com, and their own
existing Promar Instituto site (`D:\AP\projects\promar_web`), used here only
for one-page section pacing, never its palette, type, or copy.
