import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

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
