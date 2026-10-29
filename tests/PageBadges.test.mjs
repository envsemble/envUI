import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isNew, pageBadge } from '../apps/site/src/navigation/PageBadges.ts';

test('a page is New in the minor release it came in, but never in 1.0', () => {
  // A 1.1 page in a 1.1 release, a prerelease or a patch of it included.
  assert.equal(isNew('1.1.0', '1.1.0'), true);
  assert.equal(isNew('1.1.0', '1.1.3'), true);
  assert.equal(isNew('1.1.0', '1.1.0-prerelease.2'), true);
  // A 1.0 page in 1.0: the launch, when almost every page came in.
  assert.equal(isNew('1.0.0', '1.0.0'), false);
  assert.equal(isNew('1.0.0', '1.0.0-prerelease.4'), false);
  // A 1.0 page in 1.1, and a page without a version.
  assert.equal(isNew('1.0.0', '1.1.0'), false);
  assert.equal(isNew(undefined, '1.1.0'), false);
});

test('a page shows one badge, Deprecated or Experimental before New, and none for Beta or stable', () => {
  assert.equal(pageBadge({ status: 'stable', since: '1.0.0' }, '1.1.0'), undefined);
  assert.equal(pageBadge({ status: 'beta', since: '1.0.0' }, '1.1.0'), undefined);
  assert.deepEqual(pageBadge({ status: 'beta', since: '1.1.0' }, '1.1.0'), {
    label: 'New',
    tone: 'accent',
  });
  assert.equal(pageBadge({ status: 'stable', since: '1.1.0' }, '1.1.0')?.label, 'New');
  // A status takes the same tone as under the page's title.
  assert.deepEqual(pageBadge({ status: 'experimental', since: '1.1.0' }, '1.1.0'), {
    label: 'Experimental',
    tone: 'warning',
  });
  assert.deepEqual(pageBadge({ status: 'deprecated' }, '1.1.0'), {
    label: 'Deprecated',
    tone: 'danger',
  });
});
