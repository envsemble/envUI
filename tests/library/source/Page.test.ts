import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const { Page } = await importSource('Page', 'packages/ui/src/layout/Page.tsx');

const sheet = (name: string) =>
  readFileSync(join(repositoryRoot, 'packages/ui/src/styles', name), 'utf8');

test('Page renders invisible structure with its width, and its header above its content', () => {
  assert.equal(
    renderToString(h(Page, { name: 'settings', width: 'sm' }, 'Content')),
    '<div class="env-page" data-env-layout="page" data-env-name="settings" data-width="sm">Content</div>',
  );
  assert.match(
    renderToString(
      h(Page, { header: h('h1', null, 'Title'), gutter: false, render: h('article') }, 'C'),
    ),
    /^<article class="env-page" data-env-layout="page" data-width="lg" data-gutter="none"><h1>Title<\/h1><div class="env-page-content">C<\/div><\/article>$/,
  );
  const css = sheet('Page.css');
  assert.match(css, /container: env-page \/ inline-size;/);
  assert.match(css, /--env-page-gutter: var\(--_theme-page-gutter\);/);
  assert.match(
    css,
    /@container \(width >= 37\.5rem\) \{\s*\.env-page \{\s*--env-page-gutter: var\(--env-space-5\);/,
  );
});
