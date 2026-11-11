// Reading docs/: the pages the index lists, their titles, and the links between them.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readDocumentation } from '../../scripts/docs/DocumentationReader.ts';
import { inScratchFolder } from './DocumentationFixtures.ts';

const discoveryIndex =
  '# envUI documentation\n\n## Actions\n\n- [Button](button.md) — Perform an action.\n';

const discoveryPage = '# Button\n\n## Example\n\n```tsx\n<Button>Save</Button>\n```\n';

/** A docs/ folder of an index and the Button page it lists, which `run` rewrites and reads. */
function discoveryFixture(run) {
  return inScratchFolder('documentation', async (fixture) => {
    await writeFile(join(fixture, 'index.md'), discoveryIndex);
    await writeFile(join(fixture, 'button.md'), discoveryPage);
    await run({
      fixture,
      write: (name, text) => writeFile(join(fixture, name), text),
      read: () => readDocumentation(fixture),
    });
  });
}

test('Markdown discovery reads each page the index lists, in its group, with its examples', async () => {
  await discoveryFixture(async ({ read }) => {
    const [discovery, button] = read();
    assert.equal(discovery.path, 'index.md');
    assert.equal(button.path, 'button.md');
    assert.equal(button.group, 'Actions');
    assert.ok(button.markdown.includes('```tsx\n<Button>Save</Button>\n```'));
  });
});

test('a link reaches a page, and a heading the page has', async () => {
  await discoveryFixture(async ({ write, read }) => {
    await write('button.md', discoveryPage + '\n[Missing component](missing.md)\n');
    assert.throws(read, /Broken documentation link/);
    // A link to a heading must name one the page has, as the catalogue gives it its id.
    await write('button.md', discoveryPage + '\n[The example](#example)\n');
    assert.equal(read().length, 2);
    await write('button.md', `# Button\n\n## Größe\n\n[Size](#gr%C3%B6%C3%9Fe)\n`);
    assert.equal(read().length, 2);
    await write('button.md', discoveryPage + '\n[An example](#examples)\n');
    assert.throws(read, /names no heading of button\.md/);
    await write('index.md', discoveryIndex + '\nSee [its example](button.md#example).\n');
    await write('button.md', discoveryPage);
    assert.equal(read().length, 2);
    await write('index.md', discoveryIndex + '\nSee [its example](button.md#usage).\n');
    assert.throws(read, /names no heading of button\.md/);
  });
});

test("a page's title is the index's, and the index lists no page outside docs", async () => {
  await discoveryFixture(async ({ write, read }) => {
    await write('button.md', '# Different title\n');
    assert.throws(read, /title differs/);
    await write('button.md', discoveryPage);
    await write('index.md', discoveryIndex.replace('button.md', '../outside.md'));
    assert.throws(read, /escapes docs/);
  });
});
