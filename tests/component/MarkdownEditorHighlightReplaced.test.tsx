import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/MarkdownEditor.fixture.tsx';
import { mount } from './Mount.tsx';

/** A highlighter that records what it highlights, standing in for the one loaded on demand. */
const recordingHighlighter = `window.delayedHighlighting = { sources: [], loaded: true };
export async function highlightCode(source) {
  window.delayedHighlighting.sources.push(source);
  return source.split(/\\r\\n|\\r|\\n/).map((content) => [{ content, light: {}, dark: {}, lightHigh: {}, darkHigh: {} }]);
}`;
const highlighted = () =>
  (window as unknown as { delayedHighlighting?: { sources: string[]; loaded: boolean } })
    .delayedHighlighting;

// A file of its own: the frame keeps the highlighter once it has loaded it, so it must not have
// loaded before this test holds it back.
test('a delayed highlighting import skips superseded source', async () => {
  await commands.holdModuleAs('codeHighlighting', recordingHighlighter);
  try {
    mount(fixture);
    const scope = page.getByTestId('highlight-lifecycle');
    await scope.getByRole('button', { name: 'Show code workload' }).click();
    await commands.moduleRequested('codeHighlighting');
    await scope.getByRole('button', { name: 'Replace code workload' }).click();
    await commands.releaseModule('codeHighlighting');
    await expect.poll(() => highlighted()?.loaded).toBe(true);
    expect(highlighted()!.sources).toEqual(['const latest = 2;']);
    await expect
      .poll(() => scope.element().querySelector('code')?.textContent)
      .toBe('const latest = 2;');
  } finally {
    await commands.unrouteModule('codeHighlighting');
  }
});
