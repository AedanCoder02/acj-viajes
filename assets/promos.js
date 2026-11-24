// Renders the "Packages/Promos/News" section from assets/promos.json.
// Managed through the admin/ backoffice, which commits that JSON (and any
// uploaded images) straight to GitHub — this site has no backend of its own.
const DATA_URL = 'assets/promos.json';

const WHATSAPP_NUMBERS = {
  reservations: '584147927455',
  contact: '584221820114',
};

export function pickText(field, lang) {
  if (!field) return '';
  return field[lang] || field.es || field.en || '';
}

export function buildCtaHref(cta) {
  if (!cta) return null;
  if (cta.type === 'link') return cta.target;
  const number = WHATSAPP_NUMBERS[cta.target] || WHATSAPP_NUMBERS.reservations;
  const digits = number.replace(/\D/g, '');
  const message = pickText(cta.label, 'es') || 'Hola, quiero más información';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function sortPromos(items) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function publishedPromos(items) {
  return sortPromos(items.filter((item) => item.status === 'published'));
}

export function formatPrice(price, lang) {
  if (!price) return '';
  const amount = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-ES', {
    maximumFractionDigits: 0,
  }).format(price.amount);
  const note = pickText(price.note, lang);
  return `${price.currency} ${amount}${note ? ' ' + note : ''}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

export function renderPromoCard(item, lang, labels) {
  const title = pickText(item.title, lang);
  const description = pickText(item.description, lang);
  const ctaHref = buildCtaHref(item.cta);
  const ctaLabel = pickText(item.cta && item.cta.label, lang) || labels.ctaDefault;
  const badgeLabel = labels.badges[item.type] || '';
  const priceHtml = item.price
    ? `<p class="font-semibold text-amber mb-2">${escapeHtml(formatPrice(item.price, lang))}</p>`
    : '';
  const ctaHtml = ctaHref
    ? `<a href="${escapeHtml(ctaHref)}" target="_blank" rel="noopener" class="inline-block bg-amber text-ink rounded-full px-5 py-2 text-sm font-semibold hover:bg-amber/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">${escapeHtml(ctaLabel)}</a>`
    : '';

  return `
    <article class="promo-card reveal-item group relative rounded-2xl overflow-hidden shadow-xl">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
      <div class="promo-card-scrim absolute inset-0"></div>
      <span class="absolute top-4 left-4 bg-amber text-ink text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1">${escapeHtml(badgeLabel)}</span>
      <div class="absolute inset-x-0 bottom-0 p-5 text-paper">
        <h3 class="font-serif text-xl font-semibold mb-1">${escapeHtml(title)}</h3>
        <p class="text-paper/80 text-sm mb-3">${escapeHtml(description)}</p>
        ${priceHtml}
        ${ctaHtml}
      </div>
    </article>`;
}

export async function loadPromos(fetchImpl = fetch, url = DATA_URL) {
  const res = await fetchImpl(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load promos: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function collectLabels(doc) {
  const badges = {};
  doc.querySelectorAll('[data-promo-label]').forEach((el) => {
    badges[el.getAttribute('data-promo-label')] = el.textContent;
  });
  return {
    badges,
    ctaDefault: badges.cta_default || 'Ver detalles',
  };
}

export async function initPromos(doc = document, fetchImpl = fetch) {
  const container = doc.getElementById('promos-grid');
  const emptyState = doc.getElementById('promos-empty');
  if (!container) return;

  let published = [];
  try {
    const items = await loadPromos(fetchImpl);
    published = publishedPromos(items);
  } catch (e) {
    published = [];
  }

  const render = () => {
    const lang = doc.documentElement.getAttribute('data-lang') || 'es';
    const labels = collectLabels(doc);
    if (published.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }
    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = published.map((item) => renderPromoCard(item, lang, labels)).join('');
  };

  render();

  const langSelect = doc.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', () => render());
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initPromos());
}
