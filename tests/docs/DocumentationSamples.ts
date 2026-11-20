import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readDocumentation } from '../../scripts/docs/DocumentationReader.ts';
import type { PropsFile } from '../../scripts/docs/PageStructure.ts';
import { cacheDirectory, inScratchFolder } from '../support/ScratchFolder.ts';

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

export const switchProps: PropsFile = {
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

interface SamplePage {
  page: string;
  docs: string;
  examples: string;
  specimens: string;
  read: () => ReturnType<typeof readDocumentation>;
  rejects: (source: string, pattern: RegExp) => Promise<void>;
}

export function samplePage(run: (fixture: SamplePage) => Promise<void>) {
  return inScratchFolder(
    'page',
    async (folder) => {
      const docs = join(folder, 'docs');
      const examples = join(folder, 'examples');
      const specimens = join(folder, 'specimens');
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
      const rejects = async (source: string, pattern: RegExp) => {
        await writeFile(page, source);
        assert.throws(read, pattern);
      };
      await run({ page, read, rejects, examples, specimens, docs });
    },
    { within: cacheDirectory },
  );
}
