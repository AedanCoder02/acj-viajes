export const CONFIG = {
  whatsappNumbers: {
    reservations: '584147927455',
    contact: '584221820114',
  },
  defaultLang: 'es',
};

export function buildWhatsAppUrl(number, message) {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function toggleLanguage(doc = document) {
  const current = doc.documentElement.getAttribute('data-lang');
  const next = current === 'es' ? 'en' : 'es';
  applyLanguage(next, doc);
  return next;
}

export function applyLanguage(lang, doc = document) {
  doc.documentElement.setAttribute('data-lang', lang);
  doc.documentElement.setAttribute('lang', lang);
}

export function currentYear(date = new Date()) {
  return date.getFullYear();
}

export function isScrolled(scrollY, threshold = 8) {
  return scrollY > threshold;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => toggleLanguage());
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
