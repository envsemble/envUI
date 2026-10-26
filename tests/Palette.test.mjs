// The primitive palette's guarantees: every color sits in its grade's luminance band, and a grade
// difference alone gives a contrast ratio, for any two hues. scripts/build/GeneratePalette.ts builds the
// palette; tests/browser/Contrast.spec.ts checks the semantic pairs built from it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { differenceEuclidean, parse, wcagLuminance } from 'culori';
import {
  bandHalfWidth,
  contrastRatio,
  gradeBand,
  grades,
  guarantees,
  hues,
  luminanceGrade,
  paletteFile,
  writePalette,
} from '../scripts/build/GeneratePalette.ts';

const document = JSON.parse(await readFile(paletteFile, 'utf8'));
/** Every palette color: hue, grade and luminance, read from the committed file. */
const colors = Object.entries(document.palette)
  .filter(([name]) => !name.startsWith('$'))
  .flatMap(([hue, scale]) =>
    Object.entries(scale)
      .filter(([grade]) => !grade.startsWith('$'))
      .map(([grade, token]) => ({
        hue,
        grade: Number(grade),
        hex: token.$value.hex,
        luminance: wcagLuminance(parse(token.$value.hex)),
      })),
  );

test('the committed palette is what the generator builds', async () => {
  await writePalette({ check: true });
});

test('every hue has every grade, white and black only in the neutral hue', () => {
  for (const hue of Object.keys(hues)) {
    const expected = grades.filter((grade) => hue === 'neutral' || (grade !== 0 && grade !== 100));
    const actual = colors.filter((color) => color.hue === hue).map((color) => color.grade);
    assert.deepEqual(actual, expected, `${hue} has the wrong grades`);
  }
});

test('each color’s OKLCH value and hex agree', () => {
  const distance = differenceEuclidean('oklab');
  for (const [hue, scale] of Object.entries(document.palette).filter(
    ([name]) => !name.startsWith('$'),
  ))
    for (const [grade, token] of Object.entries(scale).filter(([key]) => !key.startsWith('$'))) {
      const [l, c, h] = token.$value.components;
      const oklch = { mode: 'oklch', l, c, h };
      assert.ok(
        distance(oklch, parse(token.$value.hex)) < 1e-3,
        `${hue}.${grade}: ${JSON.stringify(token.$value.components)} is not ${token.$value.hex}`,
      );
    }
});

test('every color lies inside its grade’s luminance band', () => {
  for (const color of colors) {
    const [min, max] = gradeBand(color.grade);
    assert.ok(
      color.luminance >= min - 1e-12 && color.luminance <= max + 1e-12,
      `${color.hue}.${color.grade} (${color.hex}) has luminance ${color.luminance.toFixed(5)}, outside [${min.toFixed(5)}, ${max.toFixed(5)}]`,
    );
  }
});

test('the bands are ordered and do not overlap', () => {
  for (let index = 1; index < grades.length; index++) {
    const [lighterMin] = gradeBand(grades[index - 1]);
    const [, darkerMax] = gradeBand(grades[index]);
    assert.ok(
      darkerMax < lighterMin,
      `grade ${grades[index]} reaches into grade ${grades[index - 1]}`,
    );
  }
});

test('the band edges give each guarantee for every pair of grades', () => {
  for (const lighter of grades)
    for (const darker of grades) {
      const delta = darker - lighter;
      for (const { delta: minimum, ratio } of guarantees) {
        if (delta < minimum) continue;
        // The worst case: the darkest color of the lighter grade on the lightest of the darker.
        const worst = contrastRatio(gradeBand(lighter)[0], gradeBand(darker)[1]);
        assert.ok(
          worst >= ratio,
          `grades ${lighter} and ${darker} (Δ${delta}) can measure ${worst.toFixed(3)}, below ${ratio}`,
        );
      }
    }
});

test('a grade difference gives its contrast ratio between any two palette colors', () => {
  let checked = 0;
  for (const a of colors)
    for (const b of colors) {
      const delta = b.grade - a.grade;
      if (delta <= 0) continue;
      const ratio = contrastRatio(a.luminance, b.luminance);
      for (const guarantee of guarantees) {
        if (delta < guarantee.delta) continue;
        checked++;
        assert.ok(
          ratio >= guarantee.ratio,
          `${a.hue}.${a.grade} on ${b.hue}.${b.grade} (Δ${delta}) measures ${ratio.toFixed(3)}, below ${guarantee.ratio}`,
        );
      }
    }
  assert.ok(checked > 10000, 'Check the pairs of every hue against every other hue.');
});

test('grade 50 has 4.5:1 against both white and black', () => {
  const [min, max] = gradeBand(50);
  assert.ok(contrastRatio(1, max) >= 4.5);
  assert.ok(contrastRatio(min, 0) >= 4.5);
  assert.ok(bandHalfWidth > 0 && bandHalfWidth < 0.5, 'Bands are narrower than a grade step.');
});

test('each hue stays close to its seed colors', () => {
  const distance = differenceEuclidean('oklab');
  for (const [hue, { seeds }] of Object.entries(hues))
    for (const seed of seeds) {
      const grade = luminanceGrade(wcagLuminance(parse(seed)));
      const nearest = colors
        .filter((color) => color.hue === hue)
        .reduce((best, color) =>
          Math.abs(color.grade - grade) < Math.abs(best.grade - grade) ? color : best,
        );
      const difference = distance(parse(seed), parse(nearest.hex)) * 100;
      assert.ok(
        difference < 3,
        `${hue}'s seed ${seed} (grade ${grade.toFixed(1)}) is ΔE ${difference.toFixed(2)} from ${hue}.${nearest.grade} ${nearest.hex}`,
      );
    }
});
