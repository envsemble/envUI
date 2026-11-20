import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse as parseYaml } from 'yaml';
import { componentGroups } from '../../../apps/site/src/documentation/DocumentationTypes.ts';
import { readProps } from '../../../scripts/docs/PageStructure.ts';

const familyFolders = {
  Actions: 'actions',
  'Forms & selection': 'forms',
  Navigation: 'navigation',
  'Data display': 'data-display',
  'Text & content': 'content',
  Feedback: 'feedback',
  Overlays: 'overlays',
  'App frame & layout': 'layout',
};

const elsewhere = {
  ThemeMenuRadioGroup:
    'foundations: the Menu page lists it, but it sets the theme preference beside it',
  placeholders: "foundations: the skeleton every family takes; Surface's page documents it",
  isPlaceholder: "foundations: the skeleton every family takes; Surface's page documents it",
  useSkeleton: "foundations: the skeleton every family takes; Surface's page documents it",
};

const { exports: props } = readProps()!;
const pages = readdirSync('docs/components')
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const text = readFileSync(`docs/components/${name}`, 'utf8');
    return { name, ...parseYaml(text.slice(4, text.indexOf('\n---', 4))) };
  });

test('every category has a family folder', () => {
  assert.deepEqual(Object.keys(familyFolders).sort(), [...componentGroups].sort());
});

test("a component page's exports live in its category's folder", () => {
  const misplaced: string[] = [];
  for (const { name, category, components = [] } of pages)
    for (const component of components) {
      const source = props[component]?.source;
      assert.ok(source, `${name} lists ${component}, which docs/generated/props.json lacks`);
      const folder = source.replace('packages/ui/src/', '').split('/')[0];
      const expected = Object.hasOwn(elsewhere, component)
        ? elsewhere[component as keyof typeof elsewhere].split(':')[0]
        : familyFolders[category as keyof typeof familyFolders];
      if (folder !== expected)
        misplaced.push(`${component} (${name}, ${category}) is in ${folder}/, not ${expected}/`);
    }
  assert.deepEqual(misplaced, []);
});
