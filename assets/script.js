import { I18N, I18N_HTML_KEYS, SUPPORTED_LANGS, LANG_LABELS } from './i18n.js';

export const CONFIG = {
  whatsappNumbers: {
    reservations: '584147927455',
    contact: '584221820114',
  },
  defaultLang: 'es',
  langStorageKey: 'acj-lang',
};

export function buildWhatsAppUrl(number, message) {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Matches a browser language tag to one of our supported codes, falling back
// to another member of the same language family (e.g. pt-AO -> pt-PT) before
// giving up and falling back to the site's base language.
export function detectLanguage(browserLanguages = [], supported = SUPPORTED_LANGS, fallback = 'es') {
  for (const raw of browserLanguages) {
    if (!raw) continue;
    const tag = raw.toLowerCase();
    const exact = supported.find((code) => code.toLowerCase() === tag);
    if (exact) return exact;

    const family = tag.split('-')[0];
    if (family === 'pt') {
      // Brazilian Portuguese only for pt-BR; every other pt-* region (pt-AO, pt-MZ, ...)
      // falls back to European Portuguese, which it reads closer to than pt-BR.
      return tag === 'pt-br' ? 'pt-BR' : 'pt-PT';
    }
    const match = supported.find((code) => code.toLowerCase().split('-')[0] === family);
    if (match) return match;
  }
  return fallback;
}

export function getStoredLanguage(storage = (typeof localStorage !== 'undefined' ? localStorage : null), key = CONFIG.langStorageKey) {
  if (!storage) return null;
  const value = storage.getItem(key);
  return SUPPORTED_LANGS.includes(value) ? value : null;
}

export function setStoredLanguage(lang, storage = (typeof localStorage !== 'undefined' ? localStorage : null), key = CONFIG.langStorageKey) {
  if (!storage) return;
  storage.setItem(key, lang);
}

export function resolveInitialLanguage({ stored, browserLanguages = [], supported = SUPPORTED_LANGS, fallback = CONFIG.defaultLang } = {}) {
  if (stored && supported.includes(stored)) return stored;
  return detectLanguage(browserLanguages, supported, fallback);
}

export function applyLanguage(lang, doc = document) {
  const dict = I18N[lang] || I18N[CONFIG.defaultLang];
  doc.documentElement.setAttribute('data-lang', lang);
  doc.documentElement.setAttribute('lang', lang);

  doc.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key];
    if (value === undefined) return;
    if (I18N_HTML_KEYS.has(key)) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  const select = doc.getElementById('lang-select');
  if (select) select.value = lang;

  return lang;
}

export function currentYear(date = new Date()) {
  return date.getFullYear();
}

export function isScrolled(scrollY, threshold = 8) {
  return scrollY > threshold;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      Object.keys(LANG_LABELS).forEach((code) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = LANG_LABELS[code];
        langSelect.appendChild(option);
      });

      const initialLang = resolveInitialLanguage({
        stored: getStoredLanguage(),
        browserLanguages: navigator.languages || [navigator.language],
      });
      applyLanguage(initialLang);

      langSelect.addEventListener('change', () => {
        setStoredLanguage(langSelect.value);
        applyLanguage(langSelect.value);
      });
    }

    const whatsappMessages = {
      reservations: 'Hola, quiero hacer una reserva con ACJ Viajes',
      contact: 'Hola, quiero información sobre los servicios de ACJ Viajes',
    };

    const whatsappDialog = document.getElementById('whatsapp-dialog');
    if (whatsappDialog) {
      whatsappDialog.querySelectorAll('[data-whatsapp-option]').forEach((el) => {
        const key = el.getAttribute('data-whatsapp-option');
        el.href = buildWhatsAppUrl(CONFIG.whatsappNumbers[key], whatsappMessages[key]);
      });

      let whatsappTrigger = null;
      document.querySelectorAll('.whatsapp-cta').forEach((btn) => {
        btn.addEventListener('click', () => {
          whatsappTrigger = btn;
          whatsappDialog.showModal();
        });
      });

      whatsappDialog.addEventListener('click', (event) => {
        const rect = whatsappDialog.getBoundingClientRect();
        const insideDialog =
          event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!insideDialog) {
          whatsappDialog.close();
        }
      });

      const whatsappCloseBtn = document.getElementById('whatsapp-dialog-close');
      if (whatsappCloseBtn) {
        whatsappCloseBtn.addEventListener('click', () => whatsappDialog.close());
      }

      whatsappDialog.addEventListener('close', () => {
        if (whatsappTrigger) {
          whatsappTrigger.focus();
        }
      });
    }

    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = String(currentYear());
    }

    const nav = document.getElementById('nav');
    if (nav) {
      const updateNavShadow = () => nav.classList.toggle('scrolled', isScrolled(window.scrollY));
      updateNavShadow();
      window.addEventListener('scroll', updateNavShadow, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      document.querySelectorAll('.reveal, .reveal-item').forEach((el) => observer.observe(el));
    } else {
      document.querySelectorAll('.reveal, .reveal-item').forEach((el) => el.classList.add('in'));
    }

    const cookieNotice = document.getElementById('cookie-notice');
    if (cookieNotice) {
      if (!localStorage.getItem('cookie-notice-dismissed')) {
        cookieNotice.classList.remove('hidden');
      }
      const dismissBtn = document.getElementById('cookie-dismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          cookieNotice.classList.add('hidden');
          localStorage.setItem('cookie-notice-dismissed', '1');
        });
      }
    }
  });
}
