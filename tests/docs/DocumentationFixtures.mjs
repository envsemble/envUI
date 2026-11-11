// What the documentation's tests share: a scratch folder, and a Switch page in the one-file
// structure with its example and specimen files and stand-in props.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { readDocumentation } from '../../scripts/docs/DocumentationReader.ts';

/** Runs `run` in a new folder of .cache named after `prefix`, and removes the folder after. */
export async function inScratchFolder(prefix, run) {
  const cache = resolve('.cache');
  await mkdir(cache, { recursive: true });
  const folder = await mkdtemp(join(cache, `${prefix}-`));
  try {
    return await run(folder);
  } finally {
    const contained = relative(cache, folder);
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    await rm(folder, { recursive: true, force: true });
  }
}

export const switchExample = [
  "import { Switch } from '@envsemble/envui';",
  '',
  'export default function Basic() {',
  '  return <Switch label="Alerts" />;',
  '}',
  '',
].join('\n');

export const switchFrontmatter = [
  '---',
  'title: Switch',
  'summary: An on/off setting that applies at once.',
  'status: beta',
  'since: 0.1.0',
  'category: Forms & selection',
  'aliases: [toggle]',
  'useWhen: [A setting that applies immediately.]',
  'avoidWhen:',
  '  - text: A choice that applies on submit.',
  '    use: Checkbox',
  'components: [Switch]',
  'examples:',
  '  Basic: overview',
  '  Parts: anatomy',
  '  Narrow: example',
  '  Instant:',
  '    role: do',
  '    caption: Use a switch for a setting that applies at once.',
  '  OnSubmit:',
  '    role: dont',
  "    caption: Don't use a switch in a form that applies on submit.",
  '---',
  '',
].join('\n');

/** A Switch page in the one-file structure: short text, figures placed by name and a legend. */
export const switchBody = [
  '# Switch',
  '',
  '## Variants',
  '',
  '### Sizes',
  '',
  'Two sizes, for a form and a dense list.',
  '',
  '## Anatomy',
  '',
  '```tsx figure=Parts',
  '',
  '```',
  '',
  '1. **Track** (`env-switch`): the pill.',
  '2. **Thumb** (`env-switch-input`)',
  '',
  '## Behaviour',
  '',
  '<!-- specimen: States -->',
  '',
  '### Adapting to width',
  '',
  'The label wraps.',
  '',
  '```tsx figure=Narrow widths="16 30" stage=shaded',
  '',
  '```',
  '',
  '## Rules',
  '',
  'A switch applies at once.',
  '',
  '```tsx figure=Instant',
  '',
  '```',
  '',
  '```tsx figure=OnSubmit open stage=shaded',
  '',
  '```',
  '',
  '### Labels',
  '',
  'Name the setting, not the action.',
  '',
  '## Accessibility',
  '',
  '### Keyboard',
  '',
  '| Key | Action |',
  '| --- | --- |',
  '| <kbd>Space</kbd> | Toggles the switch. |',
  '',
  '### envUI provides',
  '',
  '- The switch role.',
  '',
  '### You provide',
  '',
  '- A label.',
  '',
  '## Compose',
  '',
  '### Usage',
  '',
  'Give every switch a `label`.',
  '',
  '```tsx source=Basic',
  '',
  '```',
  '',
  '### Customize',
  '',
  '`--env-switch-track` sets the track.',
  '',
  '## Changelog',
  '',
  '- **0.1.0**: Switch.',
  '',
].join('\n');

export const switchProps = {
  exports: {
    Switch: {
      kind: 'component',
      source: 'packages/ui/src/forms/Switch.tsx',
      description: 'An on/off setting.',
      props: [
        { name: 'label', type: 'ReactNode', required: true, description: 'Visible label.' },
        { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: '' },
      ],
      native: ['input'],
      entries: ['@envsemble/envui'],
    },
    Checkbox: {
      kind: 'component',
      source: '',
      description: '',
      props: [],
      native: [],
      entries: [],
    },
  },
};

/**
 * A docs/ folder with one component page, its example and specimen files and stand-in props, which
 * `run` rewrites and reads.
 */
export function pageFixture(run) {
  return inScratchFolder('page', async (fixture) => {
    const docs = join(fixture, 'docs');
    const examples = join(fixture, 'examples');
    const specimens = join(fixture, 'specimens');
    await mkdir(join(docs, 'components'), { recursive: true });
    await mkdir(join(examples, 'switch'), { recursive: true });
    await mkdir(join(specimens, 'switch'), { recursive: true });
    await writeFile(
      join(docs, 'index.md'),
      '# envUI documentation\n\n## Forms & selection\n\n- [Switch](components/switch.md)\n',
    );
    for (const name of ['Basic', 'Parts', 'Narrow', 'Instant', 'OnSubmit'])
      await writeFile(join(examples, 'switch', `${name}.tsx`), switchExample);
    await writeFile(
      join(specimens, 'switch', 'States.tsx'),
      'export default function States() {}\n',
    );
    const page = join(docs, 'components', 'switch.md');
    await writeFile(page, switchFrontmatter + switchBody);
    const versions = new Set(['0.1.0', '0.2.0']);
    const read = () =>
      readDocumentation(docs, { props: switchProps, examples, specimens, versions });
    /** Writes `source` as the page, and expects reading the docs to fail with `pattern`. */
    const rejects = async (source, pattern) => {
      await writeFile(page, source);
      assert.throws(read, pattern);
    };
    await run({ page, read, rejects, examples, specimens, docs });
  });
}
