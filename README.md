# ACJ Viajes

Bilingual (ES/EN) static landing page for ACJ Viajes, a travel agency offering
custom land circuits, domestic/international ticketing, and lodging. No
framework, no build step — open `index.html` directly or serve the directory
with any static file server. Run `npm test` to run the test suite.

**Live:** https://aedancoder02.github.io/acj-viajes/
**Repo:** https://github.com/AedanCoder02/acj-viajes
**Deploy:** GitHub Pages, serving straight from the `master` branch root — same pattern as `promar_web`. Auto-deploys on every push to `master`; no build step, no manual redeploy command. (Previously deployed to Vercel under the Kryptyk account — rolled back; move to Vercel once a real domain exists to attach.)

**Before launch:**
- Replace `CONFIG.whatsappNumber` in `assets/script.js` with the real WhatsApp number (also update the matching hardcoded `wa.me/000000000...` hrefs in `index.html`'s CTA markup — all currently point at the same placeholder).
- Replace the placeholder canonical domain `https://acjviajes.example/` in `index.html` with the real domain once one exists.
