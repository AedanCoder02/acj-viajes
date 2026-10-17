# ACJ Viajes

Bilingual (ES/EN) static landing page for ACJ Viajes, a travel agency offering
custom land circuits, domestic/international ticketing, and lodging. No
framework, no build step — open `index.html` directly or serve the directory
with any static file server. Run `npm test` to run the test suite.

**Live:** https://acj-viajes.vercel.app
**Repo:** https://github.com/AedanCoder02/acj-viajes
**Deploy:** Vercel project `acj-viajes` under the Kryptyk account (`kryptycstore-6214s-projects`) — GitHub push does NOT auto-deploy (Vercel couldn't link the repo under this account's permissions); redeploy manually with `vercel --prod --yes --token <kryptyk-token>` from this directory after every change. Token lives in `credentials_vercel_kryptyk.md` memory.

**Before launch:**
- Replace `CONFIG.whatsappNumber` in `assets/script.js` with the real WhatsApp number (also update the matching hardcoded `wa.me/000000000...` hrefs in `index.html`'s CTA markup — all currently point at the same placeholder).
- Replace the placeholder canonical domain `https://acjviajes.example/` in `index.html` with the real domain once one exists.
