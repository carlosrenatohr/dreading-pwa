import { test } from 'node:test';
import assert from 'node:assert/strict';

import { addDays, humanDate, reflectionText, nextStreak, liturgicalColor } from '../src/format.js';

test('liturgicalColor maps the season from the title (green by default)', () => {
  assert.equal(liturgicalColor({ title: 'Lecturas del XVI Domingo del Tiempo Ordinario' }), '#2f8f5b');
  assert.equal(liturgicalColor({ title: 'Primer Domingo de Adviento' }), '#7a5abf');
  assert.equal(liturgicalColor({ title: 'Domingo de Resurrección' }), '#c49a2b');
  assert.equal(liturgicalColor({ title: 'Domingo de Ramos de la Pasión' }), '#c0473f');
  assert.equal(liturgicalColor({}), '#2f8f5b');
});

test('addDays crosses month/year boundaries in UTC', () => {
  assert.equal(addDays('2026-07-19', 1), '2026-07-20');
  assert.equal(addDays('2026-07-01', -1), '2026-06-30');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('humanDate renders Spanish weekday + date', () => {
  assert.equal(humanDate('2026-07-19'), 'domingo, 19 de julio de 2026');
});

test('reflectionText falls back to adult reflection in kids mode', () => {
  assert.equal(reflectionText({ reflection: 'A', kids_reflection: 'K' }, true), 'K');
  assert.equal(reflectionText({ reflection: 'A' }, true), 'A');
  assert.equal(reflectionText({ reflection: 'A', kids_reflection: 'K' }, false), 'A');
});

test('nextStreak increments on consecutive days, resets on a gap', () => {
  assert.deepEqual(nextStreak(null, '2026-07-19'), { date: '2026-07-19', count: 1 });
  assert.deepEqual(nextStreak({ date: '2026-07-18', count: 3 }, '2026-07-19'), { date: '2026-07-19', count: 4 });
  assert.deepEqual(nextStreak({ date: '2026-07-16', count: 3 }, '2026-07-19'), { date: '2026-07-19', count: 1 });
  assert.deepEqual(nextStreak({ date: '2026-07-19', count: 2 }, '2026-07-19'), { date: '2026-07-19', count: 2 });
});
