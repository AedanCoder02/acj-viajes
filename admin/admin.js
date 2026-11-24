// Backoffice for assets/promos.json. This site is static (GitHub Pages, no
// backend), so this admin panel edits the promos list by committing straight
// to the repo through the GitHub Contents API, using a personal access token
// kept only in this browser's localStorage. Same pattern as git-based CMSes
// (Decap/Netlify CMS) for sites with no server of their own.

const OWNER = 'AedanCoder02';
const REPO = 'acj-viajes';
const BRANCH = 'master';
const DATA_PATH = 'assets/promos.json';
const TOKEN_KEY = 'acj_admin_gh_token';

const api = (path) => `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
  };
}

// base64 encode/decode that is safe for UTF-8 text (GitHub's Contents API
// expects/returns plain base64 of the UTF-8 bytes).
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
}

async function getFile(path, token) {
  const res = await fetch(api(path) + `?ref=${BRANCH}`, { headers: authHeaders(token) });
  if (res.status === 404) return { sha: null, content: null };
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const data = await res.json();
  return { sha: data.sha, content: base64ToUtf8(data.content) };
}

async function putFile(path, content, sha, message, token) {
  const body = {
    message,
    content: utf8ToBase64(content),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(api(path), {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function putBinaryFile(path, base64Content, message, token) {
  const res = await fetch(api(path), {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: base64Content, branch: BRANCH }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'item';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- App state ---

let promosSha = null;
let promos = [];

const el = (id) => document.getElementById(id);

function showGate(message) {
  el('gate').classList.remove('hidden');
  el('dashboard').classList.add('hidden');
  el('logout-btn').classList.add('hidden');
  if (message) {
    el('gate-error').textContent = message;
    el('gate-error').classList.remove('hidden');
  }
}

function showDashboard() {
  el('gate').classList.add('hidden');
  el('dashboard').classList.remove('hidden');
  el('logout-btn').classList.remove('hidden');
}

function setStatus(message, isError = false) {
  const node = el('status-msg');
  node.textContent = message;
  node.className = `text-sm mb-4 ${isError ? 'text-red-600' : 'text-stone'}`;
}

function typeLabel(type) {
  return { package: 'Paquete', promo: 'Promoción', news: 'Novedad' }[type] || type;
}

function renderList() {
  const list = el('items-list');
  if (promos.length === 0) {
    list.innerHTML = '<p class="text-stone">Todavía no hay elementos. Crea el primero con "+ Nuevo".</p>';
    return;
  }
  const sorted = [...promos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  list.innerHTML = sorted.map((item) => `
    <article class="bg-white rounded-xl p-4 shadow flex gap-4" data-id="${item.id}">
      <img src="../${item.image || ''}" onerror="this.style.visibility='hidden'" class="w-28 h-20 object-cover rounded bg-ink/10 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold uppercase tracking-wide bg-amber text-ink rounded-full px-2 py-0.5">${typeLabel(item.type)}</span>
          <span class="text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${item.status === 'published' ? 'bg-ink text-white' : 'bg-stone/20 text-stone'}">
            ${item.status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
          <span class="text-xs text-stone">orden ${item.order ?? '—'}</span>
        </div>
        <h3 class="font-semibold">${(item.title && item.title.es) || '(sin título)'}</h3>
        <p class="text-sm text-stone truncate">${(item.description && item.description.es) || ''}</p>
      </div>
      <div class="flex flex-col gap-2 flex-shrink-0">
        <button type="button" class="text-sm underline hover:text-amber" data-action="edit">Editar</button>
        <button type="button" class="text-sm underline hover:text-amber" data-action="toggle">
          ${item.status === 'published' ? 'Despublicar' : 'Publicar'}
        </button>
        <button type="button" class="text-sm underline text-red-600 hover:text-red-700" data-action="delete">Eliminar</button>
      </div>
    </article>
  `).join('');

  list.querySelectorAll('article').forEach((article) => {
    const id = article.getAttribute('data-id');
    article.querySelector('[data-action="edit"]').addEventListener('click', () => openEditor(id));
    article.querySelector('[data-action="toggle"]').addEventListener('click', () => togglePublish(id));
    article.querySelector('[data-action="delete"]').addEventListener('click', () => deleteItem(id));
  });
}

async function loadPromos() {
  const token = getToken();
  const { sha, content } = await getFile(DATA_PATH, token);
  promosSha = sha;
  promos = content ? JSON.parse(content) : [];
}

async function savePromos(message) {
  const token = getToken();
  // Re-read the current sha right before writing, so two edits in a row
  // (or someone editing the file directly) don't get silently overwritten.
  const latest = await getFile(DATA_PATH, token);
  const result = await putFile(DATA_PATH, JSON.stringify(promos, null, 2) + '\n', latest.sha, message, token);
  promosSha = result.content.sha;
}

async function togglePublish(id) {
  const item = promos.find((p) => p.id === id);
  if (!item) return;
  item.status = item.status === 'published' ? 'draft' : 'published';
  setStatus('Guardando...');
  try {
    await savePromos(`${item.status === 'published' ? 'Publish' : 'Unpublish'} promo: ${item.title.es}`);
    setStatus('Guardado. GitHub Pages puede tardar uno o dos minutos en reflejarlo.');
    renderList();
  } catch (e) {
    setStatus(e.message, true);
  }
}

async function deleteItem(id) {
  const item = promos.find((p) => p.id === id);
  if (!item) return;
  if (!confirm(`¿Eliminar "${item.title.es}"? Esta acción no se puede deshacer.`)) return;
  promos = promos.filter((p) => p.id !== id);
  setStatus('Eliminando...');
  try {
    await savePromos(`Delete promo: ${item.title.es}`);
    setStatus('Eliminado.');
    renderList();
  } catch (e) {
    setStatus(e.message, true);
  }
}

// --- Editor dialog ---

const dialog = el('editor-dialog');
const form = el('editor-form');

el('f-cta-type').addEventListener('change', () => {
  el('f-cta-link-wrap').classList.toggle('hidden', el('f-cta-type').value !== 'link');
});

function openEditor(id) {
  const item = id ? promos.find((p) => p.id === id) : null;
  el('editor-title').textContent = item ? 'Editar elemento' : 'Nuevo elemento';
  el('f-id').value = item ? item.id : '';
  el('f-type').value = item ? item.type : 'package';
  el('f-status').value = item ? item.status : 'draft';
  el('f-order').value = item ? (item.order ?? promos.length + 1) : promos.length + 1;
  el('f-title-es').value = item ? (item.title.es || '') : '';
  el('f-title-en').value = item ? (item.title.en || '') : '';
  el('f-desc-es').value = item ? (item.description.es || '') : '';
  el('f-desc-en').value = item ? (item.description.en || '') : '';
  el('f-image').value = item ? (item.image || '') : '';
  el('upload-status').textContent = '';

  const price = item && item.price;
  el('f-price-amount').value = price ? price.amount : '';
  el('f-price-currency').value = price ? price.currency : 'USD';
  el('f-price-note').value = price && price.note ? price.note.es || '' : '';

  const cta = item && item.cta;
  let ctaType = 'whatsapp-reservations';
  if (cta && cta.type === 'link') ctaType = 'link';
  else if (cta && cta.target === 'contact') ctaType = 'whatsapp-contact';
  el('f-cta-type').value = ctaType;
  el('f-cta-link').value = cta && cta.type === 'link' ? cta.target : '';
  el('f-cta-label-es').value = cta && cta.label ? cta.label.es || '' : '';
  el('f-cta-label-en').value = cta && cta.label ? cta.label.en || '' : '';
  el('f-cta-link-wrap').classList.toggle('hidden', ctaType !== 'link');

  dialog.showModal();
}

el('new-item-btn').addEventListener('click', () => openEditor(null));
el('editor-cancel').addEventListener('click', () => dialog.close());

el('f-image-upload').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const uploadStatus = el('upload-status');
  uploadStatus.textContent = 'Subiendo imagen...';
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const base64 = dataUrl.split(',')[1];
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `assets/images/promos/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${ext}`;
    await putBinaryFile(path, base64, `Upload promo image: ${file.name}`, getToken());
    el('f-image').value = path;
    uploadStatus.textContent = 'Imagen subida.';
  } catch (e) {
    uploadStatus.textContent = `Error al subir: ${e.message}`;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = el('f-id').value || slugify(el('f-title-es').value) + '-' + Math.random().toString(36).slice(2, 7);

  const amount = el('f-price-amount').value;
  const price = amount
    ? {
        amount: Number(amount),
        currency: el('f-price-currency').value || 'USD',
        note: { es: el('f-price-note').value || '' },
      }
    : null;

  const ctaTypeField = el('f-cta-type').value;
  const cta = {
    type: ctaTypeField === 'link' ? 'link' : 'whatsapp',
    target: ctaTypeField === 'link' ? el('f-cta-link').value
      : ctaTypeField === 'whatsapp-contact' ? 'contact' : 'reservations',
    label: { es: el('f-cta-label-es').value || '', en: el('f-cta-label-en').value || '' },
  };

  const item = {
    id,
    type: el('f-type').value,
    status: el('f-status').value,
    order: Number(el('f-order').value) || 0,
    image: el('f-image').value,
    title: { es: el('f-title-es').value, en: el('f-title-en').value },
    description: { es: el('f-desc-es').value, en: el('f-desc-en').value },
    price,
    cta,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  const existingIndex = promos.findIndex((p) => p.id === id);
  if (existingIndex >= 0) promos[existingIndex] = item;
  else promos.push(item);

  setStatus('Guardando...');
  try {
    await savePromos(`${existingIndex >= 0 ? 'Update' : 'Add'} promo: ${item.title.es}`);
    dialog.close();
    setStatus('Guardado. GitHub Pages puede tardar uno o dos minutos en reflejarlo.');
    renderList();
  } catch (e) {
    setStatus(e.message, true);
  }
});

// --- Token gate ---

async function tryEnter(token) {
  setToken(token);
  try {
    await loadPromos();
    showDashboard();
    renderList();
    setStatus('');
  } catch (e) {
    clearToken();
    showGate('No se pudo conectar con GitHub. Verifica que el token sea válido y tenga permiso de "Contents" sobre AedanCoder02/acj-viajes.');
  }
}

el('token-submit').addEventListener('click', () => {
  const token = el('token-input').value.trim();
  if (!token) return;
  tryEnter(token);
});

el('logout-btn').addEventListener('click', () => {
  clearToken();
  el('token-input').value = '';
  showGate();
});

(function init() {
  const existing = getToken();
  if (existing) tryEnter(existing);
  else showGate();
})();
