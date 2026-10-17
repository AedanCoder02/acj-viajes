export const CONFIG = {
  // PLACEHOLDER — replace with the real ACJ Viajes WhatsApp number before launch.
  whatsappNumber: '000000000',
  defaultLang: 'es',
};

export function buildWhatsAppUrl(number, message) {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function toggleLanguage(doc = document) {
  const current = doc.documentElement.getAttribute('data-lang');
  const next = current === 'es' ? 'en' : 'es';
  doc.documentElement.setAttribute('data-lang', next);
  return next;
}

export function applyLanguage(lang, doc = document) {
  doc.documentElement.setAttribute('data-lang', lang);
}

export function currentYear(date = new Date()) {
  return date.getFullYear();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => toggleLanguage());
    }

    const ctaMessage = 'Hola, quiero información sobre los servicios de ACJ Viajes';
    document.querySelectorAll('.whatsapp-cta').forEach((el) => {
      el.href = buildWhatsAppUrl(CONFIG.whatsappNumber, ctaMessage);
    });

    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = String(currentYear());
    }
  });
}
