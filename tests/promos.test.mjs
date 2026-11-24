import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  pickText,
  buildCtaHref,
  sortPromos,
  publishedPromos,
  formatPrice,
  renderPromoCard,
} from '../assets/promos.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const promosJson = JSON.parse(readFileSync(new URL('../assets/promos.json', import.meta.url), 'utf8'));

test('pickText prefers the requested language, then falls back to es, then en', () => {
  assert.equal(pickText({ es: 'Hola', en: 'Hi' }, 'en'), 'Hi');
  assert.equal(pickText({ es: 'Hola' }, 'en'), 'Hola');
  assert.equal(pickText({ en: 'Hi' }, 'fr'), 'Hi');
  assert.equal(pickText(null, 'es'), '');
});

test('buildCtaHref builds a wa.me link for whatsapp CTAs using the real numbers', () => {
  const href = buildCtaHref({ type: 'whatsapp', target: 'reservations', label: { es: 'Reservar' } });
  assert.match(href, /^https:\/\/wa\.me\/584147927455\?text=/);
});

test('buildCtaHref passes through a link CTA unchanged', () => {
  assert.equal(buildCtaHref({ type: 'link', target: 'https://example.com/x' }), 'https://example.com/x');
});

test('sortPromos orders by the "order" field, ascending', () => {
  const sorted = sortPromos([{ id: 'b', order: 2 }, { id: 'a', order: 1 }]);
  assert.deepEqual(sorted.map((i) => i.id), ['a', 'b']);
});

test('publishedPromos filters out drafts', () => {
  const items = [{ id: 'a', status: 'published', order: 1 }, { id: 'b', status: 'draft', order: 2 }];
  assert.deepEqual(publishedPromos(items).map((i) => i.id), ['a']);
});

test('formatPrice includes currency, amount, and the localized note', () => {
  const price = { amount: 450, currency: 'USD', note: { es: 'por persona', en: 'per person' } };
  assert.equal(formatPrice(price, 'es'), 'USD 450 por persona');
  assert.equal(formatPrice(price, 'en'), 'USD 450 per person');
  assert.equal(formatPrice(null, 'es'), '');
});

test('renderPromoCard escapes HTML in title/description to avoid injecting markup from the data file', () => {
  const item = {
    type: 'promo',
    image: 'assets/images/x.jpg',
    title: { es: '<script>x</script>' },
    description: { es: 'desc' },
    price: null,
    cta: null,
  };
  const html_ = renderPromoCard(item, 'es', { badges: { promo: 'Promoción' }, ctaDefault: 'Ver detalles' });
  assert.doesNotMatch(html_, /<script>x<\/script>/);
  assert.match(html_, /&lt;script&gt;/);
});

test('renderPromoCard shows the price only when the item has one', () => {
  const withPrice = { type: 'package', image: 'a.jpg', title: { es: 't' }, description: { es: 'd' }, price: { amount: 10, currency: 'USD' }, cta: null };
  const withoutPrice = { ...withPrice, price: null };
  const labels = { badges: { package: 'Paquete' }, ctaDefault: 'Ver detalles' };
  assert.match(renderPromoCard(withPrice, 'es', labels), /USD/);
  assert.doesNotMatch(renderPromoCard(withoutPrice, 'es', labels), /USD/);
});

test('assets/promos.json is a well-formed array with required fields and existing images', () => {
  assert.ok(Array.isArray(promosJson));
  for (const item of promosJson) {
    assert.ok(item.id, 'item needs an id');
    assert.ok(['package', 'promo', 'news'].includes(item.type), `unexpected type ${item.type}`);
    assert.ok(['draft', 'published'].includes(item.status), `unexpected status ${item.status}`);
    assert.ok(item.title && item.title.es, 'item needs an es title');
    assert.ok(item.description && item.description.es, 'item needs an es description');
    assert.ok(existsSync(new URL(`../${item.image}`, import.meta.url)), `missing image ${item.image}`);
  }
});

test('homepage has a promos section below the hero with the grid and i18n label template JS reads', () => {
  const heroIndex = html.indexOf('id="inicio"');
  const promosIndex = html.indexOf('id="promos"');
  assert.ok(promosIndex > heroIndex, 'promos section should come after the hero');
  const promosSection = html.match(/<section id="promos"[\s\S]*?<\/section>/)[0];
  assert.match(promosSection, /id="promos-grid"/);
  assert.match(promosSection, /id="promos-empty"/);
  for (const key of ['package', 'promo', 'news', 'cta_default']) {
    assert.match(promosSection, new RegExp(`data-promo-label="${key}"`));
  }
});

test('homepage loads assets/promos.js as a module after assets/script.js', () => {
  const scriptIndex = html.indexOf('src="assets/script.js"');
  const promosScriptIndex = html.indexOf('src="assets/promos.js"');
  assert.ok(scriptIndex > -1 && promosScriptIndex > scriptIndex, 'promos.js should load after script.js so i18n labels are already applied');
});

test('admin backoffice exists, is not indexable, and is not linked from the public nav/footer', () => {
  assert.ok(existsSync(new URL('../admin/index.html', import.meta.url)));
  assert.ok(existsSync(new URL('../admin/admin.js', import.meta.url)));
  const adminHtml = readFileSync(new URL('../admin/index.html', import.meta.url), 'utf8');
  assert.match(adminHtml, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.doesNotMatch(html, /href="admin\//, 'the public site should not link to the backoffice');
});
