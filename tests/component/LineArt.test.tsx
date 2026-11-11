import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/LineArt.fixture.tsx';
import { mount } from './Mount.tsx';

/**
 * Each line's dash offset, in lines' lengths, to a hundredth: 0 draws it whole, 1 or -1 not at all.
 */
const offsets = (svg: Element) =>
  [...svg.children].map((line) => {
    const style = getComputedStyle(line);
    const offset = parseFloat(style.strokeDashoffset) / parseFloat(style.strokeDasharray);
    return Math.round(offset * 100) / 100 || 0;
  });

/**
 * Holds the lines' animations at a time, in ms from their start, or a moment before their ends,
 * so that they don't end.
 */
function holdAt(svg: Element, time: number | 'end') {
  for (const animation of svg.getAnimations({ subtree: true })) {
    animation.pause();
    animation.currentTime =
      time === 'end' ? Number(animation.effect!.getComputedTiming().endTime) - 1 : time;
  }
}

/** Ends the lines' animations, as the time they take would. */
const finish = (svg: Element) =>
  svg.getAnimations({ subtree: true }).forEach((each) => each.finish());

/** The moving drawing, what has ended so far, and a picture of every line at an offset. */
function open() {
  mount(fixture);
  // The drawing is drawn afresh for each motion, so each read finds it again.
  const art = () => page.getByTestId('moving').element();
  const ended = () => page.getByTestId('ended').element().textContent;
  const all = (offset: number) => Array.from({ length: art().children.length }, () => offset);
  const press = (name: string) => page.getByRole('button', { name, exact: true }).click();
  return { art, ended, all, press };
}

// The motions are CSS animations of the lines' dash offset, as drawn, which each engine runs.
test(
  'its lines draw themselves in and out, a loop ending each turn where the next begins',
  { tags: ['engines'] },
  async () => {
    const { art, ended, all, press } = open();
    const turn = () => art().getAttribute('data-turn');

    // A loop draws the lines in from nothing and holds them whole, then draws them out to nothing,
    // where the next turn starts: a whole dash period on, the same picture.
    await press('loop');
    await expect.poll(turn).toBe('in');
    expect(art().querySelector('line')!.getAttribute('pathLength')).toBe('1');
    holdAt(art(), 0);
    expect(offsets(art())).toEqual(all(1));
    holdAt(art(), 'end');
    expect(offsets(art())).toEqual(all(0));
    finish(art());
    await expect.poll(turn).toBe('out');
    holdAt(art(), 0);
    expect(offsets(art())).toEqual(all(0));
    holdAt(art(), 'end');
    expect(offsets(art())).toEqual(all(-1));
    finish(art());
    await expect.poll(turn).toBe('in');
    holdAt(art(), 0);
    expect(offsets(art())).toEqual(all(1));
    // A loop never ends.
    expect(ended()).toBe('');

    // The one-shot motions end where they say, and say so.
    await press('appear');
    await expect.poll(turn).toBeNull();
    holdAt(art(), 0);
    expect(offsets(art())).toEqual(all(1));
    finish(art());
    await expect.poll(ended).toBe('appear');
    expect(offsets(art())).toEqual(all(0));
    await press('play');
    holdAt(art(), 0);
    expect(offsets(art())).toEqual(all(0));
    finish(art());
    await expect.poll(ended).toBe('appear play');
    expect(offsets(art())).toEqual(all(-2));
    await press('disappear');
    finish(art());
    await expect.poll(ended).toBe('appear play disappear');
    expect(offsets(art())).toEqual(all(-1));
  },
);

test(
  'with reduced motion, a motion shows where it ends at once, and a loop stays whole',
  { tags: ['engines'] },
  async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    const { art, ended, all, press } = open();
    await press('appear');
    await expect.poll(ended).toBe('appear');
    expect(offsets(art())).toEqual(all(0));
    await press('disappear');
    await expect.poll(ended).toBe('appear disappear');
    expect(offsets(art())).toEqual(all(-1));
    await press('play');
    await expect.poll(ended).toBe('appear disappear play');
    expect(offsets(art())).toEqual(all(-2));
    await press('loop');
    await expect.poll(() => art().getAttribute('data-turn')).toBe('in');
    expect(art().getAnimations({ subtree: true })).toHaveLength(0);
    expect(offsets(art())).toEqual(all(0));
  },
);
