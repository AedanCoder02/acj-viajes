import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIG,
  buildWhatsAppUrl,
  detectLanguage,
  resolveInitialLanguage,
  applyLanguage,
  currentYear,
  isScrolled,
} from '../assets/script.js';
import { SUPPORTED_LANGS } from '../assets/i18n.js';

test('CONFIG.whatsappNumbers holds both real ACJ Viajes numbers in international digits-only form', () => {
  assert.equal(CONFIG.whatsappNumbers.reservations, '584147927455');
  assert.equal(CONFIG.whatsappNumbers.contact, '584221820114');
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

test('SUPPORTED_LANGS covers all 9 required languages', () => {
  for (const code of ['en', 'es', 'pt-BR', 'pt-PT', 'fr', 'it', 'de', 'ja', 'zh']) {
    assert.ok(SUPPORTED_LANGS.includes(code), `expected ${code} to be supported`);
  }
  assert.equal(SUPPORTED_LANGS.length, 9);
});

test('detectLanguage picks an exact match from navigator.languages', () => {
  assert.equal(detectLanguage(['fr-FR', 'en'], SUPPORTED_LANGS, 'es'), 'fr');
});

test('detectLanguage falls back to a same-family match (e.g. pt-AO -> pt-PT)', () => {
  assert.equal(detectLanguage(['pt-AO'], SUPPORTED_LANGS, 'es'), 'pt-PT');
});

test('detectLanguage falls back to the site base language when nothing matches', () => {
  assert.equal(detectLanguage(['ru-RU', 'ko-KR'], SUPPORTED_LANGS, 'es'), 'es');
});

test('resolveInitialLanguage prefers a stored explicit choice over browser detection', () => {
  assert.equal(
    resolveInitialLanguage({ stored: 'de', browserLanguages: ['fr-FR'], supported: SUPPORTED_LANGS }),
    'de'
  );
});

test('resolveInitialLanguage falls back to browser detection when nothing is stored', () => {
  assert.equal(
    resolveInitialLanguage({ stored: null, browserLanguages: ['ja-JP'], supported: SUPPORTED_LANGS }),
    'ja'
  );
});

test('applyLanguage swaps every [data-i18n] element and updates the html lang attributes', () => {
  const elements = {
    attrs: { 'data-lang': 'es', lang: 'es' },
  };
  const el1 = { textContent: '', getAttribute: () => 'nav.services' };
  const fakeDoc = {
    documentElement: {
      getAttribute: (name) => elements.attrs[name],
      setAttribute: (name, v) => { elements.attrs[name] = v; },
    },
    querySelectorAll: (selector) => (selector === '[data-i18n]' ? [el1] : []),
    getElementById: () => null,
  };
  applyLanguage('fr', fakeDoc);
  assert.equal(elements.attrs['data-lang'], 'fr');
  assert.equal(elements.attrs.lang, 'fr');
  assert.equal(el1.textContent, 'Services');
});

test('currentYear reads the year from a given date', () => {
  assert.equal(currentYear(new Date('2026-06-15T12:00:00Z')), 2026);
});

test('isScrolled is false at the top of the page and true past the threshold', () => {
  assert.equal(isScrolled(0), false);
  assert.equal(isScrolled(4), false);
  assert.equal(isScrolled(50), true);
});
