import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/LineArt.fixture.tsx';
import { mount } from './support/Mount.tsx';

const dashOffsetsInLineLengths = (svg: Element) =>
  [...svg.children].map((line) => {
    const style = getComputedStyle(line);
    const offset = parseFloat(style.strokeDashoffset) / parseFloat(style.strokeDasharray);
    return Math.round(offset * 100) / 100 || 0;
  });

function holdAt(svg: Element, time: number | 'end') {
  for (const animation of svg.getAnimations({ subtree: true })) {
    animation.pause();
    animation.currentTime =
      time === 'end' ? Number(animation.effect!.getComputedTiming().endTime) - 1 : time;
  }
}

const finish = (svg: Element) =>
  svg.getAnimations({ subtree: true }).forEach((each) => each.finish());

function mountMovingLineArt() {
  mount(fixture);
  const art = () => page.getByTestId('moving').element();
  const ended = () => page.getByTestId('ended').element().textContent;
  const everyLineAt = (offset: number) =>
    Array.from({ length: art().children.length }, () => offset);
  const press = (name: string) => page.getByRole('button', { name, exact: true }).click();
  return { art, ended, everyLineAt, press };
}

test(
  'its lines draw themselves in and out, a loop ending each turn where the next begins',
  { tags: ['engines'] },
  async () => {
    const { art, ended, everyLineAt, press } = mountMovingLineArt();
    const turn = () => art().getAttribute('data-turn');

    await press('loop');
    await expect.poll(turn).toBe('in');
    expect(art().querySelector('line')!.getAttribute('pathLength')).toBe('1');
    holdAt(art(), 0);
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(1));
    holdAt(art(), 'end');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(0));
    finish(art());
    await expect.poll(turn).toBe('out');
    holdAt(art(), 0);
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(0));
    holdAt(art(), 'end');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(-1));
    finish(art());
    await expect.poll(turn).toBe('in');
    holdAt(art(), 0);
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(1));
    expect(ended()).toBe('');

    await press('appear');
    await expect.poll(turn).toBeNull();
    holdAt(art(), 0);
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(1));
    finish(art());
    await expect.poll(ended).toBe('appear');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(0));
    await press('play');
    holdAt(art(), 0);
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(0));
    finish(art());
    await expect.poll(ended).toBe('appear play');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(-2));
    await press('disappear');
    finish(art());
    await expect.poll(ended).toBe('appear play disappear');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(-1));
  },
);

test(
  'with reduced motion, a motion shows where it ends at once, and a loop stays whole',
  { tags: ['engines'] },
  async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    const { art, ended, everyLineAt, press } = mountMovingLineArt();
    await press('appear');
    await expect.poll(ended).toBe('appear');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(0));
    await press('disappear');
    await expect.poll(ended).toBe('appear disappear');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(-1));
    await press('play');
    await expect.poll(ended).toBe('appear disappear play');
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(-2));
    await press('loop');
    await expect.poll(() => art().getAttribute('data-turn')).toBe('in');
    expect(art().getAnimations({ subtree: true })).toHaveLength(0);
    expect(dashOffsetsInLineLengths(art())).toEqual(everyLineAt(0));
  },
);
