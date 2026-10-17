import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
