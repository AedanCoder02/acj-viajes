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
  assert.equal(currentYear(new Date('2026-06-15T12:00:00Z')), 2026);
});
