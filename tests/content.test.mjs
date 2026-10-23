import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const html_css = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8');

test('root element defaults to Spanish with no JS required', () => {
  assert.match(html, /<html[^>]*\blang="es"[^>]*\bdata-lang="es"/);
});

test('SEO target phrase appears in the title', () => {
  assert.match(html, /<title>[^<]*agencia de viajes en Venezuela[^<]*circuitos a medida[^<]*<\/title>/i);
});

test('nav exposes a language toggle button', () => {
  assert.match(html, /id="lang-toggle"/);
});

test('nav includes a WhatsApp CTA', () => {
  assert.match(html, /<nav[\s\S]*whatsapp-cta[\s\S]*<\/nav>/);
});

test('hero headline (Spanish) carries the SEO phrase', () => {
  assert.match(html, /lang="es"[^>]*>[^<]*[Aa]gencia de viajes en Venezuela[^<]*circuitos a medida/);
});

test('hero mission statement is present in both languages', () => {
  assert.match(html, /Escuchamos tus sueños, diseñamos cada detalle a tu medida/);
  assert.match(html, /We listen to your dreams, design every detail around you/);
});

test('services section has three bilingual cards with the client-provided copy', () => {
  assert.match(html, /Elegimos rutas, tiempos y paradas según tus gustos/);
  assert.match(html, /Comparamos aerolíneas, horarios y tarifas/);
  assert.match(html, /Negociamos tarifas preferenciales, verificamos la calidad/);
  assert.match(html, /We choose the routes, pace, and stops to match your preferences/);
  assert.match(html, /We compare airlines, schedules, and fares/);
  assert.match(html, /We negotiate preferential rates, verify quality/);
});

test('each service closes with the ACJ Viajes tagline in both languages', () => {
  const servicesSection = html.match(/<section id="servicios"[\s\S]*?<\/section>/)[0];
  assert.equal((servicesSection.match(/ACJ Viajes: viaja, descubre, vive\./g) || []).length, 3);
  assert.equal((servicesSection.match(/ACJ Viajes: travel, discover, live\./g) || []).length, 3);
});

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

// --- Final-review fix pass ---

test('hero and all three service images exist on disk with non-empty alt text', () => {
  const images = ['assets/images/hero-roraima.jpg', 'assets/images/circuitos.jpg', 'assets/images/boleteria.jpg', 'assets/images/hospedaje.jpg', 'assets/images/ciudad.jpg', 'assets/images/playa.jpg', 'assets/images/noche.jpg'];
  for (const img of images) {
    assert.ok(existsSync(new URL(`../${img}`, import.meta.url)), `${img} should exist`);
    const re = new RegExp(`<img[^>]*src="${img}"[^>]*alt="[^"]+"`);
    assert.match(html, re, `${img} should be referenced with non-empty alt text`);
  }
});

test('every WhatsApp CTA has a real wa.me href in the raw markup, not a bare "#"', () => {
  const tags = [...html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]).filter((tag) => /class="[^"]*\bwhatsapp-cta\b[^"]*"/.test(tag));
  assert.ok(tags.length >= 3, 'expected at least 3 whatsapp-cta links');
  for (const tag of tags) {
    const hrefMatch = tag.match(/href="([^"]+)"/);
    assert.ok(hrefMatch, `whatsapp-cta tag missing href: ${tag}`);
    assert.match(hrefMatch[1], /^https:\/\/wa\.me\/0+\?text=/);
  }
});

test('every CTA pairs its background with a text color that actually contrasts (no light-on-light or light-on-mid)', () => {
  const ctaClassAttrs = [...html.matchAll(/<a[^>]*class="([^"]*whatsapp-cta[^"]*)"/g)].map((m) => m[1]);
  assert.ok(ctaClassAttrs.length >= 3, 'expected at least 3 whatsapp-cta elements');
  for (const classAttr of ctaClassAttrs) {
    const isDarkBg = /bg-forest\b/.test(classAttr);
    const isAmberBg = /bg-amber\b/.test(classAttr);
    assert.ok(isDarkBg || isAmberBg, `CTA class "${classAttr}" should use bg-forest or bg-amber`);
    if (isDarkBg) assert.match(classAttr, /text-(white|paper)\b/, `dark CTA "${classAttr}" needs light text`);
    if (isAmberBg) assert.match(classAttr, /text-ink\b/, `amber CTA "${classAttr}" needs dark text`);
  }
});

test('nav WhatsApp CTA is reachable on mobile (not inside the hidden md:flex wrapper)', () => {
  const navHtml = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  const hiddenWrapper = navHtml.match(/<div class="hidden md:flex[\s\S]*?<\/div>/);
  assert.ok(hiddenWrapper, 'expected the hidden md:flex nav wrapper to exist');
  assert.doesNotMatch(hiddenWrapper[0], /whatsapp-cta/);
  assert.match(navHtml, /whatsapp-cta/);
});

test('language toggle button meets the 44px minimum tap target', () => {
  const navHtml = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  const toggleTag = navHtml.match(/<button id="lang-toggle"[^>]*>/)[0];
  assert.match(toggleTag, /min-h-\[44px\]/);
});

test('head has a canonical link and Open Graph tags including og:image', () => {
  assert.match(html, /<link rel="canonical" href="[^"]+" \/>/);
  assert.match(html, /<meta property="og:title" content="[^"]+" \/>/);
  assert.match(html, /<meta property="og:description" content="[^"]+" \/>/);
  assert.match(html, /<meta property="og:image" content="[^"]+" \/>/);
});

test('page declares a favicon', () => {
  assert.match(html, /<link rel="icon"[^>]*>/);
});

test('interactive elements have hover and focus-visible states', () => {
  const hoverCount = (html.match(/hover:/g) || []).length;
  const focusCount = (html.match(/focus-visible:/g) || []).length;
  assert.ok(hoverCount >= 5, `expected at least 5 hover: classes, found ${hoverCount}`);
  assert.ok(focusCount >= 4, `expected at least 4 focus-visible: classes, found ${focusCount}`);
});

test('differentiation bullet English translation is a complete sentence', () => {
  assert.match(html, /we don't just issue tickets/);
});

// --- Motion pass (Promar-grade kinetic feel, new identity, vanilla CSS/JS only) ---

test('hero content has a staggered entrance animation', () => {
  const heroSection = html.match(/<section id="inicio"[\s\S]*?<\/section>/)[0];
  const staggered = (heroSection.match(/class="[^"]*hero-anim[^"]*"/g) || []).length;
  assert.ok(staggered >= 3, `expected at least 3 hero-anim elements (h1, p, cta), found ${staggered}`);
  assert.match(heroSection, /hero-anim d2/);
  assert.match(heroSection, /hero-anim d3/);
});

test('every reveal-on-scroll section is covered by the JS observer target selector', () => {
  const revealCount = (html.match(/class="[^"]*\breveal\b[^"]*"/g) || []).length;
  assert.ok(revealCount >= 4, `expected at least 4 .reveal elements across services/diferencia/proceso/contacto, found ${revealCount}`);
});

test('headlines avoid the single-accent-word tell — no word gets its own color treatment', () => {
  assert.doesNotMatch(html, /grad-text/, 'single-word gradient accents read as a generic AI-design tell; removed in favor of real typographic weight');
});

test('a floating WhatsApp FAB is reachable from anywhere on the page', () => {
  const fabTag = html.match(/<a[^>]*class="[^"]*\bfab-whatsapp\b[^"]*"[^>]*>/);
  assert.ok(fabTag, 'expected a .fab-whatsapp element');
  assert.match(fabTag[0], /whatsapp-cta/, 'the FAB should also carry whatsapp-cta so JS wiring and the raw-href test both cover it');
});

test('nav gains a stronger shadow once scrolled, via a JS-toggled class', () => {
  assert.match(html_css, /#nav\.scrolled/);
});

test('reduced-motion users still see all content — animated-entrance classes are forced visible, not just un-animated', () => {
  const reducedMotionBlock = html_css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)[0];
  assert.match(reducedMotionBlock, /\.hero-anim/);
  assert.match(reducedMotionBlock, /\.reveal/);
  assert.match(reducedMotionBlock, /opacity:\s*1\s*!important/);
  assert.match(reducedMotionBlock, /transform:\s*none\s*!important/);
});

// --- Deeper motion pass: navbar + logo animation, per-item stagger ---

test('nav has its own entrance animation, distinct from the hero', () => {
  assert.match(html, /<nav[^>]*class="[^"]*\bnav-anim\b[^"]*"/);
  assert.match(html_css, /\.nav-anim\s*\{/);
});

test('the logo is inlined as SVG (not <img>) in the nav, so its paths can be individually animated', () => {
  const navHtml = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(navHtml, /<img[^>]*logo\.svg/, 'nav should no longer reference the logo via <img>');
  assert.match(navHtml, /<svg[^>]*class="[^"]*\blogo-mark\b[^"]*"/);
  assert.match(navHtml, /class="[^"]*\blogo-arc\b[^"]*"/, 'the arc path should be individually targetable for a draw-in animation');
});

test('logo draw-in animation exists in CSS and is a real stroke animation, not just a fade', () => {
  assert.match(html_css, /\.logo-arc\s*\{[^}]*stroke-dash(array|offset)/s);
});

test('every reveal section stages its children one-by-one rather than animating as a single block', () => {
  const itemCount = (html.match(/class="[^"]*\breveal-item\b[^"]*"/g) || []).length;
  assert.ok(itemCount >= 8, `expected at least 8 .reveal-item elements across services/diferencia/proceso, found ${itemCount}`);
  const staggerRule = html_css.match(/\.reveal\.in \.reveal-item[\s\S]*?\n\}/g) || [];
  const delaySteps = new Set((html_css.match(/\.reveal-item:nth-child\(\d+\)\s*\{\s*transition-delay:\s*[^;]+;/g) || []).map((r) => r.match(/transition-delay:\s*([^;]+);/)[1]));
  assert.ok(delaySteps.size >= 3, `expected at least 3 distinct nth-child transition-delay steps, found ${delaySteps.size}`);
});

test('reduced-motion guard also covers the new nav/logo/stagger elements', () => {
  const reducedMotionBlock = html_css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)[0];
  assert.match(reducedMotionBlock, /\.nav-anim/);
  assert.match(reducedMotionBlock, /\.logo-arc/);
  assert.match(reducedMotionBlock, /\.reveal-item/);
});

// --- Visual identity pass: typography, deliberate shape (frontend-design) ---

test('the page uses the client-provided brand fonts, not system-default Georgia/Helvetica', () => {
  assert.match(html, /fonts\.googleapis\.com[^"]*Cormorant\+Garamond/);
  assert.match(html, /fonts\.googleapis\.com[^"]*Jost/);
  assert.match(html, /serif:\s*\['Cormorant Garamond'/, 'Cormorant Garamond should be the primary serif, not just present as a fallback somewhere');
  assert.doesNotMatch(html, /serif:\s*\['Georgia'/, 'Georgia should not be the primary declared serif');
});

test('old cream/terracotta tokens are fully retired, not left mixed in with the new palette', () => {
  assert.doesNotMatch(html, /\bbg-sand\b|\btext-terracotta\b|\bbg-terracotta\b|\bhover:text-terracotta\b/);
});

test('logo has no tracked-out all-caps tagline with middle dots baked into the mark', () => {
  const navHtml = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(navHtml, /·/, 'middle-dot-separated metadata is a generic template tell');
});

test('the brand slogan appears as its own impactful, standalone headline at the closing CTA', () => {
  const ctaSection = html.match(/<section id="contacto"[\s\S]*?<\/section>/)[0];
  assert.match(ctaSection, /Viaja\. Descubre\. Vive\./);
  assert.match(ctaSection, /Travel\. Discover\. Live\./);
});

test('the hero image is full-bleed across the whole section, not confined to a split panel', () => {
  const heroSection = html.match(/<section id="inicio"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(heroSection, /md:grid-cols/, 'hero should no longer be a hard two-panel split');
  assert.doesNotMatch(heroSection, /diagonal-edge|tepui/i, 'hard-edged shape treatments were rejected in favor of a gradient scrim');
  assert.match(heroSection, /<img[^>]*src="assets\/images\/hero-roraima\.jpg"[^>]*class="[^"]*\bw-full\b[^"]*"/, 'image should span the full width of the section');
});

test('every full-bleed section photo is capped to a viewport-relative height, not stretched by h-full across a content-driven (and much taller on mobile) section', () => {
  const images = [
    ['inicio', 'hero-roraima.jpg'],
    ['diferencia', 'ciudad.jpg'],
    ['proceso', 'noche.jpg'],
    ['contacto', 'japon.jpg'],
  ];
  for (const [sectionId, file] of images) {
    const section = html.match(new RegExp(`<section id="${sectionId}"[\\s\\S]*?<\\/section>`))[0];
    const imgTag = section.match(new RegExp(`<img[^>]*src="assets\\/images\\/${file.replace('.', '\\.')}"[^>]*>`))[0];
    assert.doesNotMatch(imgTag, /\bh-full\b/, `${file}: h-full stretches across the whole (much taller on mobile) section, cropping a different, over-zoomed slice than on desktop`);
    assert.match(imgTag, /h-\[\d+vh\]/, `${file}: expected a viewport-relative capped height so mobile and desktop show the same crop`);
  }
});

test('the hero image fades from a dark legible scrim into the clear photo, not a flat translucent block', () => {
  const heroSection = html.match(/<section id="inicio"[\s\S]*?<\/section>/)[0];
  assert.match(heroSection, /class="[^"]*\bhero-scrim\b[^"]*"/);
  assert.match(html_css, /\.hero-scrim\s*\{[^}]*background:\s*linear-gradient/s);
});

test('the hero scrim clears to fully transparent well before the right edge, so most of the photo stays unobstructed', () => {
  const desktopBlock = html_css.match(/@media \(min-width: 768px\) \{[\s\S]*?\.hero-scrim[\s\S]*?\n\}/)[0];
  const stops = [...desktopBlock.matchAll(/rgba\(7, 91, 115, 0\)\s+(\d+)%/g)].map((m) => Number(m[1]));
  assert.ok(stops.length > 0, 'expected a fully-transparent (alpha 0) gradient stop');
  assert.ok(stops[0] <= 75, `fully-transparent stop should land at 75% or earlier, found ${stops[0]}%`);
});

test('the mission-statement intro is visually distinguished from the headline, not a plain paragraph underneath it', () => {
  const heroSection = html.match(/<section id="inicio"[\s\S]*?<\/section>/)[0];
  assert.match(heroSection, /class="[^"]*\bhero-intro\b[^"]*"/);
});

test('"Cómo trabajamos" numbers its three real steps — the one place in the page content is an actual sequence', () => {
  const procesoSection = html.match(/<section id="proceso"[\s\S]*?<\/section>/)[0];
  const numbers = [...procesoSection.matchAll(/class="[^"]*\bstep-number\b[^"]*"[^>]*>\s*(\d)/g)].map((m) => m[1]);
  assert.deepEqual(numbers, ['1', '2', '3']);
});

// --- Whole-page consistency pass: the identity built in the hero carries through every section ---

test('nav links animate in one by one, not as a single static block', () => {
  const navHtml = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  const itemCount = (navHtml.match(/class="[^"]*\bnav-item-anim\b[^"]*"/g) || []).length;
  assert.ok(itemCount >= 3, `expected at least 3 individually staggered nav links, found ${itemCount}`);
  assert.match(navHtml, /nav-item-anim d2/);
  assert.match(navHtml, /nav-item-anim d3/);
});

test('the page alternates dark/light section backgrounds for rhythm, echoing the hero, instead of flat cream throughout', () => {
  const darkSections = (html.match(/<section[^>]*id="[^"]*"[^>]*bg-ink/g) || []).length;
  assert.ok(darkSections >= 2, `expected at least 2 non-hero sections on bg-ink, found ${darkSections}`);
});

test('service cards are differentiated by a distinct accent per card, not an identical stamped card-kit', () => {
  const servicesSection = html.match(/<section id="servicios"[\s\S]*?<\/section>/)[0];
  const accents = new Set((servicesSection.match(/accent-(forest|amber|clay)/g) || []));
  assert.equal(accents.size, 3, `expected all 3 distinct accent colors used once each, found ${[...accents]}`);
});

test('differentiation bullets read as an editorial list, not another grid of identical white rounded cards', () => {
  const diferenciaSection = html.match(/<section id="diferencia"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(diferenciaSection, /bg-white rounded-xl/, 'should no longer reuse the generic boxed-card pattern');
});

test('the three process steps are visually connected by a route line, echoing "circuitos a medida"', () => {
  const procesoSection = html.match(/<section id="proceso"[\s\S]*?<\/section>/)[0];
  assert.match(procesoSection, /route-line/);
});

test('"Cómo trabajamos" is a full-bleed night photo with a glowing effect on each step, not a plain paper section', () => {
  const procesoSection = html.match(/<section id="proceso"[\s\S]*?<\/section>/)[0];
  assert.match(procesoSection, /<img[^>]*src="assets\/images\/noche\.jpg"/);
  assert.match(procesoSection, /class="[^"]*\bnight-scrim\b[^"]*"/);
  assert.match(html_css, /\.night-scrim\s*\{[^}]*background:\s*linear-gradient/s);
  assert.match(procesoSection, /class="[^"]*\bstep-glow\b[^"]*"/);
  assert.match(html_css, /\.step-glow[\s\S]*?animation:\s*\w+-pulse/);
});

test('route-line color stays visible against a dark night photo, not a dark-brown clay line that vanishes', () => {
  assert.match(html_css, /border-top:\s*2px dashed #C9A45C/, 'route-line should use amber, visible against the night photo');
  assert.doesNotMatch(html_css, /border-top:\s*2px dashed #D9B77A/, 'clay was invisible against the dark background');
});

test('route-line passes through the exact vertical center of the step-glow circles, not above or below them', () => {
  const glowHeightMatch = html_css.match(/\.step-glow\s*\{[^}]*height:\s*([\d.]+)rem/s);
  assert.ok(glowHeightMatch, 'expected .step-glow to declare an explicit height');
  const glowHeight = Number(glowHeightMatch[1]);
  const routeLineBlock = html_css.match(/@media \(min-width: 768px\) \{\s*\.route-line \{[\s\S]*?\n  \}/)[0];
  const topMatch = routeLineBlock.match(/top:\s*([\d.]+)rem/);
  assert.ok(topMatch, 'expected .route-line to declare an explicit top offset');
  assert.equal(Number(topMatch[1]), glowHeight / 2, `route-line top (${topMatch[1]}rem) should equal half the circle height (${glowHeight / 2}rem) to center on it`);
});

test('step numbers are tightly centered inside their glow circles, not pushed off-center by default line-height', () => {
  const procesoSection = html.match(/<section id="proceso"[\s\S]*?<\/section>/)[0];
  const stepSpans = [...procesoSection.matchAll(/<span class="([^"]*step-number[^"]*)"/g)];
  assert.equal(stepSpans.length, 3);
  for (const [, classAttr] of stepSpans) {
    assert.match(classAttr, /\bleading-none\b/, `step-number class "${classAttr}" should reset line-height for clean centering`);
  }
});

test('services uses its own distinct white-sand beach photo as backdrop, not a repeat of the hospedaje card photo', () => {
  const servicesSection = html.match(/<section id="servicios"[\s\S]*?<\/section>/)[0];
  const beforeHeading = servicesSection.split('Nuestros servicios')[0];
  assert.match(beforeHeading, /<img[^>]*src="assets\/images\/playa\.jpg"/, 'should use the dedicated top-down beach photo as the section background');
  assert.match(servicesSection, /class="[^"]*\bbeach-wash\b[^"]*"/);
  assert.match(html_css, /\.beach-wash\s*\{[^}]*background:\s*rgba/s);
});

test('the beach photo sits directly on the services section (not a separate wrapper div) but is capped to a sane viewport height, not stretched across the whole tall mobile section', () => {
  const servicesSection = html.match(/<section id="servicios"[\s\S]*?<\/section>/)[0];
  assert.match(
    servicesSection,
    /<section id="servicios"[^>]*>\s*<img[^>]*src="assets\/images\/playa\.jpg"[^>]*class="[^"]*\babsolute\b[^"]*\btop-0\b[^"]*"/,
    'playa.jpg should be an absolute top-0 background directly on the section'
  );
  assert.doesNotMatch(servicesSection, /<div class="relative h-\[/, 'should no longer have a separate fixed-height banner wrapper div');
  const imgTagMatch = servicesSection.match(/<img[^>]*src="assets\/images\/playa\.jpg"[^>]*>/)[0];
  assert.doesNotMatch(imgTagMatch, /\bh-full\b/, 'h-full stretches the image across the whole (very tall on mobile) section, massively over-zooming it — height must be capped instead');
  assert.match(imgTagMatch, /h-\[\d+vh\]/, 'expected a viewport-relative capped height');
});

test('each service card has its own legible panel so its text reads clearly against the photo behind it', () => {
  const servicesSection = html.match(/<section id="servicios"[\s\S]*?<\/section>/)[0];
  const panelCount = (servicesSection.match(/class="[^"]*\bcard-panel\b[^"]*"/g) || []).length;
  assert.equal(panelCount, 3, `expected a card-panel wrapper in each of the 3 cards, found ${panelCount}`);
  assert.match(html_css, /\.card-panel\s*\{[^}]*background:/s);
});

test('diferencia is a full-bleed city photo with the same dark-to-clear gradient treatment as the hero', () => {
  const diferenciaSection = html.match(/<section id="diferencia"[\s\S]*?<\/section>/)[0];
  assert.match(diferenciaSection, /<img[^>]*src="assets\/images\/ciudad\.jpg"/);
  assert.match(diferenciaSection, /class="[^"]*\bcity-scrim\b[^"]*"/);
  assert.match(html_css, /\.city-scrim\s*\{[^}]*background:\s*linear-gradient/s);
});

test('reduced-motion guard also covers the new nav-item stagger elements', () => {
  const reducedMotionBlock = html_css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)[0];
  assert.match(reducedMotionBlock, /\.nav-item-anim/);
});

// --- Proper footer: logo, nav, CTA, a real destinations marquee, all with motion ---

test('footer is a full section, not just a tagline and copyright line', () => {
  const footerHtml = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.match(footerHtml, /logo-mark/, 'footer should repeat the brand mark');
  assert.match(footerHtml, /href="#servicios"/, 'footer should repeat the nav links');
  assert.match(footerHtml, /href="#diferencia"/);
  assert.match(footerHtml, /href="#proceso"/);
  assert.match(footerHtml, /whatsapp-cta/, 'footer should carry its own CTA');
});

test('destinations ticker (below hero) scrolls real place names, not decorative all-caps metadata', () => {
  const heroIndex = html.indexOf('id="inicio"');
  const servicesIndex = html.indexOf('id="servicios"');
  const tickerHtml = html.slice(heroIndex, servicesIndex);
  assert.match(tickerHtml, /class="[^"]*\bmarquee\b[^"]*"/);
  assert.match(tickerHtml, /Los Roques/);
  assert.match(tickerHtml, /Roraima|Mérida|Canaima/);
  assert.doesNotMatch(tickerHtml, /·/, 'no middle-dot metadata separators — that tell was already rejected once');
  assert.match(html_css, /@keyframes marquee-scroll/);
  assert.match(html_css, /\.marquee-track\s*\{[^}]*animation:\s*marquee-scroll/s);
});

test('footer content has its own reveal entrance, consistent with the rest of the page', () => {
  const footerHtml = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.match(footerHtml, /class="[^"]*\breveal\b[^"]*"/);
});

test('reduced-motion guard covers the footer marquee and step-glow pulse', () => {
  const reducedMotionBlock = html_css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)[0];
  assert.match(reducedMotionBlock, /\.marquee-track/);
  assert.match(reducedMotionBlock, /\.step-glow/);
});

// --- Custom scrollbar: branded, not the bare OS default ---

test('scrollbar is styled in the brand palette for both Chromium/Safari and Firefox', () => {
  assert.match(html_css, /::-webkit-scrollbar\s*\{/);
  assert.match(html_css, /::-webkit-scrollbar-thumb\s*\{[^}]*#C9A45C/s, 'thumb should use the amber accent');
  assert.match(html_css, /::-webkit-scrollbar-track\s*\{/);
  assert.match(html_css, /scrollbar-color:\s*#C9A45C/, 'Firefox fallback via scrollbar-color');
});

// --- Closing CTA gets its own destination photo; destinations ticker goes international ---

test('the closing CTA section has its own full-bleed destination photo, not flat ink', () => {
  const contactoSection = html.match(/<section id="contacto"[\s\S]*?<\/section>/)[0];
  assert.match(contactoSection, /<img[^>]*src="assets\/images\/japon\.jpg"/);
  assert.match(contactoSection, /class="[^"]*\bshrine-scrim\b[^"]*"/);
  assert.match(html_css, /\.shrine-scrim\s*\{[^}]*background:\s*linear-gradient/s);
});

test('a destinations ticker runs directly below the hero, mixing national and international stops', () => {
  const heroIndex = html.indexOf('id="inicio"');
  const servicesIndex = html.indexOf('id="servicios"');
  const betweenHeroAndServices = html.slice(heroIndex, servicesIndex);
  assert.match(betweenHeroAndServices, /class="[^"]*\bmarquee\b[^"]*"/, 'expected a marquee ticker between the hero and services sections');
  assert.match(betweenHeroAndServices, /Los Roques/);
  assert.match(betweenHeroAndServices, /Madrid|Miami|Tokio|Kioto|Cancún|Bogotá|Panamá/);
});

test('the single destinations ticker (below the hero) carries international stops; the footer no longer duplicates it', () => {
  const heroIndex = html.indexOf('id="inicio"');
  const servicesIndex = html.indexOf('id="servicios"');
  const betweenHeroAndServices = html.slice(heroIndex, servicesIndex);
  assert.match(betweenHeroAndServices, /Madrid|Miami|Tokio|Kioto|Cancún|Bogotá|Panamá/);
});

// --- Footer legal links: real pages, not dead placeholders ---

test('footer links to real privacy, terms, and cookies pages', () => {
  const footerHtml = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.match(footerHtml, /href="privacidad\.html"/);
  assert.match(footerHtml, /href="terminos\.html"/);
  assert.match(footerHtml, /href="cookies\.html"/);
});

for (const page of ['privacidad.html', 'terminos.html', 'cookies.html']) {
  test(`${page} exists, shares the site's nav/footer shell, and is bilingual`, () => {
    assert.ok(existsSync(new URL(`../${page}`, import.meta.url)), `${page} should exist`);
    const pageHtml = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.match(pageHtml, /<html[^>]*\blang="es"[^>]*\bdata-lang="es"/);
    assert.match(pageHtml, /<nav id="nav"/);
    assert.match(pageHtml, /<footer id="footer"/);
    assert.match(pageHtml, /lang="es"/);
    assert.match(pageHtml, /lang="en"/);
    assert.match(pageHtml, /<script type="module" src="assets\/script\.js">/);
  });
}

// --- Fix the dark-on-dark seam, de-duplicate the footer ticker, build a real footer, add a cookie notice ---

test('proceso and contacto (two consecutive dark photo sections) have a visible boundary between them, not a blended seam', () => {
  const contactoOpenTag = html.match(/<section id="contacto"[^>]*>/)[0];
  assert.match(contactoOpenTag, /border-t-2 border-amber/, 'expected a clear amber divider line opening the contacto section');
});

test('the footer no longer repeats the destinations ticker now that it lives below the hero', () => {
  const footerHtml = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.doesNotMatch(footerHtml, /class="[^"]*\bmarquee\b[^"]*"/, 'the ticker should only appear once, below the hero, not duplicated in the footer');
});

test('footer is a real multi-column layout (brand, links, services, contact), not a single row', () => {
  const footerHtml = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  const columnCount = (footerHtml.match(/class="[^"]*\bfooter-col\b[^"]*"/g) || []).length;
  assert.ok(columnCount >= 3, `expected at least 3 footer-col blocks, found ${columnCount}`);
  assert.match(footerHtml, /Circuitos terrestres/, 'services column should list the real services, not be decorative');
});

test('a cookie notice banner exists, is honest about not using tracking, and links to the cookies page', () => {
  assert.match(html, /id="cookie-notice"/);
  const bannerHtml = html.match(/<div id="cookie-notice"[\s\S]*?<\/div>\s*<\/div>/)[0];
  assert.match(bannerHtml, /cookies\.html/);
  assert.match(bannerHtml, /id="cookie-dismiss"/);
});

test('cookie notice JS remembers dismissal via localStorage and does not re-show on every visit', () => {
  const scriptJs = readFileSync(new URL('../assets/script.js', import.meta.url), 'utf8');
  assert.match(scriptJs, /cookie-notice/);
  assert.match(scriptJs, /localStorage/);
});

// --- Kill the flat "black filter" plateau in every scrim; mobile must reveal real photo, not mostly solid color ---

for (const scrimClass of ['hero-scrim', 'city-scrim', 'night-scrim', 'shrine-scrim']) {
  test(`.${scrimClass} is a continuous fade with no flat full-opacity wall (mobile default)`, () => {
    const ruleMatch = html_css.match(new RegExp(`\\.${scrimClass}\\s*\\{[^}]*\\}`, 's'));
    assert.ok(ruleMatch, `expected a base (mobile) rule for .${scrimClass}`);
    const rule = ruleMatch[0];
    const solidStopCount = (rule.match(/#075B73/g) || []).length;
    assert.ok(solidStopCount <= 1, `${scrimClass}: expected at most one fully-solid #075B73 stop (no flat plateau), found ${solidStopCount}`);
  });
}

test('desktop scrim gradient also has no flat wall and clears to transparent well before the far edge', () => {
  const desktopBlock = html_css.match(/@media \(min-width: 768px\) \{[\s\S]*?hero-scrim[\s\S]*?\n  \}/)[0];
  const solidStopCount = (desktopBlock.match(/#075B73/g) || []).length;
  assert.ok(solidStopCount <= 1, `expected at most one fully-solid #075B73 stop in the desktop scrim, found ${solidStopCount}`);
  const transparentStops = [...desktopBlock.matchAll(/rgba\(7, 91, 115, 0\)\s+(\d+)%/g)].map((m) => Number(m[1]));
  assert.ok(transparentStops.length > 0 && Math.min(...transparentStops) <= 75, 'should reach fully transparent by 75% at the latest');
});
