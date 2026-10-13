import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await fs.readFile(new URL('../src/utils/pageBoundaries.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
const { planPageSlices } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('single page and exact page boundaries do not produce trailing blank pages', () => {
  assert.deepEqual(planPageSlices(100, 100, []), [{ start: 0, end: 100 }]);
  assert.deepEqual(planPageSlices(0, 100, []), [{ start: 0, end: 0 }]);
  assert.equal(planPageSlices(300, 100, []).length, 3);
});
test('a boundary through a glyph line retreats without rounding fractional coordinates', () => {
  assert.deepEqual(planPageSlices(150, 100, [{ top: 94.25, bottom: 110.75 }]),
    [{ start: 0, end: 94.25 }, { start: 94.25, end: 150 }]);
});
test('short entries and heading plus first line move together', () => {
  const result = planPageSlices(180, 100, [{ top: 95, bottom: 110 }], [{ top: 75, bottom: 125 }]);
  assert.equal(result[0].end, 75);
});
test('oversized entries split by lines and avoid rules cannot cause an infinite loop', () => {
  const lines = Array.from({ length: 60 }, (_, n) => ({ top: n * 20, bottom: n * 20 + 18 }));
  const pages = planPageSlices(1200, 100, lines, [{ top: 0, bottom: 1200 }]);
  assert.equal(pages.length, 12);
  assert.deepEqual(planPageSlices(180, 100, [], [{ top: 0, bottom: 100.01 }]).length, 2);
});
test('overlapping spans retreat repeatedly; a block at the start falls back to line boundaries', () => {
  const result = planPageSlices(180, 100, [{ top: 90, bottom: 105 }, { top: 85, bottom: 95 }], [{ top: 0, bottom: 100 }]);
  assert.equal(result[0].end, 85);
});
test('hundreds of variable lines remain whole, ordered, with neither gaps nor overlap', () => {
  const lines = Array.from({ length: 400 }, (_, i) => ({ top: i * 23.25, bottom: i * 23.25 + 20.5 }));
  const height = lines.at(-1).bottom;
  const pages = planPageSlices(height, 1000, lines);
  assert.equal(pages[0].start, 0);
  assert.equal(pages.at(-1).end, height);
  for (let i = 0; i < pages.length; i++) {
    assert.ok(pages[i].end - pages[i].start <= 1000);
    if (i) assert.equal(pages[i].start, pages[i - 1].end);
  }
  for (const line of lines) assert.equal(pages.filter(p => line.top >= p.start && line.bottom <= p.end).length, 1);
});
test('invalid dimensions and text taller than a page fail explicitly', () => {
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => planPageSlices(100, value, []));
  assert.throws(() => planPageSlices(200, 100, [{ top: 0, bottom: 101 }]));
});
