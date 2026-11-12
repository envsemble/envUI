// Each component lives in the family folder of its page's category, so an agent who knows the
// documentation finds its code: a component page's category names the folder of packages/ui/src
// that holds every export the page lists.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse as parseYaml } from 'yaml';
import { componentGroups } from '../../../scripts/docs/model/DocumentationTypes.ts';

/** The family folder of each category. */
const folders = {
  Actions: 'actions',
  'Forms & selection': 'forms',
  Navigation: 'navigation',
  'Data display': 'data-display',
  'Text & content': 'content',
  Feedback: 'feedback',
  Overlays: 'overlays',
  'App frame & layout': 'layout',
};

/** Exports a page lists that live elsewhere, each with its reason. */
const elsewhere = {
  ThemeMenuRadioGroup:
    'foundations: the Menu page lists it, but it sets the theme preference beside it',
  placeholders: "foundations: the skeleton every family takes; Surface's page documents it",
  isPlaceholder: "foundations: the skeleton every family takes; Surface's page documents it",
  useSkeleton: "foundations: the skeleton every family takes; Surface's page documents it",
};

const { exports: props } = JSON.parse(readFileSync('docs/generated/props.json', 'utf8'));
const pages = readdirSync('docs/components')
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const text = readFileSync(`docs/components/${name}`, 'utf8');
    return { name, ...parseYaml(text.slice(4, text.indexOf('\n---', 4))) };
  });

test('every category has a family folder', () => {
  assert.deepEqual(Object.keys(folders).sort(), [...componentGroups].sort());
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
        : folders[category as keyof typeof folders];
      if (folder !== expected)
        misplaced.push(`${component} (${name}, ${category}) is in ${folder}/, not ${expected}/`);
    }
  assert.deepEqual(misplaced, []);
});
