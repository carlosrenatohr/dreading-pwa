import { API_BASE } from './config.js';
import { createApi } from './src/api.js';
import { addDays, humanDate, reflectionText, nextStreak, liturgicalColor, prayer } from './src/format.js';

const api = createApi(API_BASE);
const $ = (id) => document.getElementById(id);
const todayIso = () => new Date().toISOString().slice(0, 10);

const state = { date: todayIso(), reading: null, section: 0, kids: false };

function setStatus(msg) {
  $('status').textContent = msg;
  $('status').hidden = !msg;
  $('app').hidden = !!msg;
}

async function loadDate(iso) {
  setStatus('Cargando la lectura…');
  try {
    let reading = await api.byDate(iso);
    // On first open, today may not be published yet — fall back to the latest.
    if (!reading && iso === todayIso()) {
      reading = await api.last();
      if (reading) iso = reading.date_raw.slice(0, 10);
    }
    if (!reading) return setStatus('No hay lectura para este día todavía.');
    state.date = iso;
    state.reading = reading;
    state.section = 0;
    render();
  } catch (err) {
    setStatus(`No se pudo cargar la lectura. Revisa la conexión con la API (${API_BASE}).`);
  }
}

function render() {
  const r = state.reading;
  $('date').textContent = humanDate(state.date);
  $('title').textContent = r.title || 'Lectura del día';
  document.documentElement.style.setProperty('--accent', liturgicalColor(r));
  const hero = $('hero');
  if (r.image_url) { hero.src = r.image_url; hero.hidden = false; } else { hero.hidden = true; }
  renderTabs();
  renderSection();
  renderReflection();
  showStreak();
  setStatus('');
}

function renderTabs() {
  const tabs = $('tabs');
  tabs.innerHTML = '';
  (state.reading.lecturas || []).forEach((lectura, i) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.type = 'button';
    b.role = 'tab';
    b.textContent = lectura.title || `Lectura ${i + 1}`;
    b.setAttribute('aria-selected', String(i === state.section));
    b.addEventListener('click', () => { state.section = i; renderSection(); });
    tabs.appendChild(b);
  });
}

function renderSection() {
  const lectura = (state.reading.lecturas || [])[state.section] || {};
  const first = lectura.first_line || '';
  let body = lectura.content || '';
  if (first && body.startsWith(first)) body = body.slice(first.length).trim();
  $('incipit').textContent = first;
  $('incipit').hidden = !first;
  $('body').textContent = body;
  document.querySelectorAll('.tab').forEach((t, i) =>
    t.setAttribute('aria-selected', String(i === state.section)));
  stopSpeaking();
}

function renderReflection() {
  const r = state.reading;
  $('reflection').textContent = reflectionText(r, state.kids);
  $('message').textContent = r.message ? `“${r.message}”` : '';
  const q = $('questions');
  q.innerHTML = '';
  (r.questions || []).forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    q.appendChild(li);
  });
}

function readStreak() {
  try { return JSON.parse(localStorage.getItem('dreading_streak')); } catch (_) { return null; }
}

// Display the current streak (no increment).
function showStreak() {
  const s = readStreak();
  if (s && s.count) { $('streak').textContent = `🔥 ${s.count} días seguidos`; $('streak').hidden = false; }
  else { $('streak').hidden = true; }
}

// Reward the day's streak — only when the reader closes the prayer with "Amén".
function bumpStreak(iso) {
  const prev = readStreak();
  const already = !!(prev && prev.date === iso);
  const s = nextStreak(prev, iso);
  localStorage.setItem('dreading_streak', JSON.stringify(s));
  return { count: s.count, already };
}

/* --- Prayer modal + streak reward --- */
function openPrayer() {
  $('prayer').textContent = prayer(state.reading);
  $('modal').hidden = false;
}
function closeModal() { $('modal').hidden = true; }
function amen() {
  closeModal();
  if (state.date !== todayIso()) return showStreak();
  const { count, already } = bumpStreak(todayIso());
  $('streak').textContent = already ? `🔥 ${count} días seguidos` : `¡Amén! 🔥 ${count} ${count === 1 ? 'día' : 'días'} de racha`;
  $('streak').hidden = false;
}

/* --- Listen (browser text-to-speech, free & offline) --- */
let speaking = false;
function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  speaking = false;
  $('listen').textContent = '▶ Escuchar';
}
function toggleListen() {
  if (!window.speechSynthesis) return;
  if (speaking) return stopSpeaking();
  const lectura = (state.reading.lecturas || [])[state.section] || {};
  const u = new SpeechSynthesisUtterance(`${lectura.title}. ${lectura.content || ''}`);
  u.lang = 'es-ES';
  u.onend = stopSpeaking;
  window.speechSynthesis.speak(u);
  speaking = true;
  $('listen').textContent = '⏸ Detener';
}

async function share() {
  const r = state.reading;
  const payload = { title: r.title, text: r.message || r.title, url: location.href };
  try {
    if (navigator.share) await navigator.share(payload);
    else { await navigator.clipboard.writeText(`${payload.text} — ${payload.url}`); $('share').textContent = '¡Copiado!'; }
  } catch (_) {}
}

/* --- Install prompt --- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $('install').hidden = false;
});

/* --- Theme (light / dark), persisted; defaults to the system preference --- */
function applyTheme(t) {
  if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  $('theme').textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾';
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('dreading_theme', next);
  applyTheme(next);
}

function wire() {
  applyTheme(localStorage.getItem('dreading_theme') || '');
  $('theme').addEventListener('click', toggleTheme);
  $('prev').addEventListener('click', () => loadDate(addDays(state.date, -1)));
  $('next').addEventListener('click', () => loadDate(addDays(state.date, 1)));
  $('today').addEventListener('click', () => loadDate(todayIso()));
  $('kids').addEventListener('change', (e) => { state.kids = e.target.checked; renderReflection(); });
  $('listen').addEventListener('click', toggleListen);
  $('share').addEventListener('click', share);
  $('pray').addEventListener('click', openPrayer);
  $('amen').addEventListener('click', amen);
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });
  $('install').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt = null;
    $('install').hidden = true;
  });
}

// Migrate clients stuck on the old workers.dev subdomain.
const stored = localStorage.getItem('dreading_api');
if (stored && stored.includes('honchkrow1995')) {
  localStorage.removeItem('dreading_api');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

wire();
loadDate(todayIso());
