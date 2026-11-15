import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isNew, pageBadge } from '../../apps/site/src/routes/PageBadges.ts';

test('a page is New in the minor release it came in, but never in 1.0', () => {
  assert.equal(isNew('1.1.0', '1.1.0'), true);
  assert.equal(isNew('1.1.0', '1.1.3'), true);
  assert.equal(isNew('1.1.0', '1.1.0-prerelease.2'), true);
  assert.equal(isNew('1.0.0', '1.0.0'), false);
  assert.equal(isNew('1.0.0', '1.0.0-prerelease.4'), false);
  assert.equal(isNew('1.0.0', '1.1.0'), false);
  assert.equal(isNew(undefined, '1.1.0'), false);
});

test('a page shows one badge, Deprecated or Alpha before New, and none for Beta or stable', () => {
  assert.equal(pageBadge({ status: 'stable', since: '1.0.0' }, '1.1.0'), undefined);
  assert.equal(pageBadge({ status: 'beta', since: '1.0.0' }, '1.1.0'), undefined);
  assert.deepEqual(pageBadge({ status: 'beta', since: '1.1.0' }, '1.1.0'), {
    label: 'New',
    tone: 'accent',
  });
  assert.equal(pageBadge({ status: 'stable', since: '1.1.0' }, '1.1.0')?.label, 'New');
  assert.deepEqual(pageBadge({ status: 'alpha', since: '1.1.0' }, '1.1.0'), {
    label: 'Alpha',
    tone: 'warning',
  });
  assert.deepEqual(pageBadge({ status: 'deprecated' }, '1.1.0'), {
    label: 'Deprecated',
    tone: 'danger',
  });
});
