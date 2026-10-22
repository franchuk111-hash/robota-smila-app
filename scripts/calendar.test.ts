import assert from 'node:assert/strict';
import test from 'node:test';
import { HOLIDAYS, YEAR, buildMonth, monthStats, yearStats } from '../lib/calendar';

test('2026 baseline counts weekdays independently of holiday labels', () => {
  assert.equal(YEAR, 2026);
  assert.deepEqual(yearStats(), {work: 261, off: 104, holidays: 11});
  const expected = [22, 20, 22, 22, 21, 22, 23, 21, 22, 22, 21, 23];
  expected.forEach((work, month) => {
    const stats = monthStats(month);
    assert.equal(stats.work, work);
    assert.equal(stats.hours, work * 8);
    assert.equal(stats.days, new Date(Date.UTC(2026, month + 1, 0)).getUTCDate());
    assert.equal(stats.days, stats.work + stats.off);
  });
});

test('updated holiday dates remain informational on weekdays', () => {
  assert.equal(HOLIDAYS['2026-05-09'], undefined);
  assert.match(HOLIDAYS['2026-05-08'], /День пам/);
  assert.match(HOLIDAYS['2026-07-15'], /Державності/);
  for (const [month, day] of [[0,1],[4,8],[6,15],[9,1],[11,25]]) {
    const date = buildMonth(month).find(cell => cell?.day === day);
    assert.ok(date?.holiday);
    assert.equal(date.weekend, false);
  }
  assert.equal(monthStats(4).holidays.length, 3);
});
