// Pure date/reading helpers — no DOM, no network, so they unit-test cleanly.

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Work in UTC throughout so a reading's calendar date never shifts by timezone.
function _utc(iso) {
  return new Date(`${iso}T00:00:00Z`);
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  const d = _utc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDate(d);
}

// "sábado, 19 de julio de 2026"
export function humanDate(iso) {
  const d = _utc(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

// The reading a client should show for a section tab; readings arrive in
// liturgical order already, this just guards against a missing field.
export function sectionLabel(lectura) {
  return (lectura && lectura.title) || 'Lectura';
}

export function reflectionText(reading, kidsMode) {
  if (!reading) return '';
  return kidsMode ? (reading.kids_reflection || reading.reflection || '') : (reading.reflection || '');
}

// Liturgical accent colour, inferred from the reading's title (the source names
// the season). Green = Tiempo Ordinario is the default.
const _SEASONS = [
  [/adviento|cuaresma|cuaresmal|ceniza/i, '#7a5abf'], // morado — Adviento/Cuaresma
  [/pascua|resurrec|navidad|epifan|solemnidad|as[uú]nci[oó]n|todos los santos|sant[íi]sim/i, '#c49a2b'], // blanco/oro — fiestas
  [/ramos|pasi[oó]n|pentecost|m[áa]rtir|esp[íi]ritu santo/i, '#c0473f'], // rojo — mártires/Pentecostés
];
export function liturgicalColor(reading) {
  const title = (reading && reading.title) || '';
  for (const [re, color] of _SEASONS) if (re.test(title)) return color;
  return '#2f8f5b'; // verde — Tiempo Ordinario
}

// A short prayer around the day's reading (weaves in the AI "message of the day"
// when present). Kept light + universal; an AI-generated prayer can replace it later.
export function prayer(reading) {
  const msg = reading && reading.message ? ` Que hoy recuerde: «${reading.message}».` : '';
  return `Señor Jesús, gracias por tu Palabra de este día.${msg} Que eche raíces en mi corazón, guíe mis pasos y me acerque a ti y a los demás. Quédate conmigo hoy.`;
}

// Daily streak: +1 when today directly follows the last read day, reset to 1 on
// a gap, unchanged when already counted today.
export function nextStreak(prev, todayIso) {
  if (!prev || !prev.date) return { date: todayIso, count: 1 };
  if (prev.date === todayIso) return prev;
  return prev.date === addDays(todayIso, -1)
    ? { date: todayIso, count: prev.count + 1 }
    : { date: todayIso, count: 1 };
}
