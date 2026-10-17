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
  const images = ['assets/images/hero-roraima.jpg', 'assets/images/circuitos.jpg', 'assets/images/boleteria.jpg', 'assets/images/hospedaje.jpg'];
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

// --- Visual identity pass: typography, tepui motif, deliberate shape (frontend-design) ---

test('the page uses an intentional Google Fonts pairing, not system-default Georgia/Helvetica', () => {
  assert.match(html, /fonts\.googleapis\.com[^"]*Spectral/);
  assert.match(html, /fonts\.googleapis\.com[^"]*Work\+Sans/);
  assert.match(html, /serif:\s*\['Spectral'/, 'Spectral should be the primary serif, not just present as a fallback somewhere');
  assert.doesNotMatch(html, /serif:\s*\['Georgia'/, 'Georgia should not be the primary declared serif');
});

test('old cream/terracotta tokens are fully retired, not left mixed in with the new palette', () => {
  assert.doesNotMatch(html, /\bbg-sand\b|\btext-terracotta\b|\bbg-terracotta\b|\bhover:text-terracotta\b/);
});

test('logo subtitle reads as considered copy, not a tracked-out all-caps label with middle dots', () => {
  const navHtml = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(navHtml, /·/, 'middle-dot-separated metadata is a generic template tell');
  assert.doesNotMatch(navHtml, /VIAJA/, 'tracked-out all-caps tagline should be replaced with sentence case');
  assert.match(navHtml, /viaja, descubre, vive/i);
});

test('the hero has an asymmetric split with a tepui-silhouette edge, not a flat rectangle', () => {
  const heroSection = html.match(/<section id="inicio"[\s\S]*?<\/section>/)[0];
  assert.match(heroSection, /tepui-edge/, 'expected a clip-path element carrying the tepui-skyline shape');
  assert.match(html_css, /\.tepui-edge\s*\{[^}]*clip-path/s);
});

test('a tepui-skyline divider separates the hero from the next section, echoing the clip-path motif', () => {
  assert.match(html, /tepui-divider/);
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
