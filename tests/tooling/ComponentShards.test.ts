import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDurations, shardsOf } from '../../scripts/test/ComponentShards.ts';

test('shards split the files by their time, a new file at the median, each file once', () => {
  const durations = { 'a.tsx': 50, 'b.tsx': 30, 'c.tsx': 20, 'd.tsx': 10, 'e.tsx': 10 };
  const shards = shardsOf([...Object.keys(durations), 'new.tsx', 'a.tsx'], durations, 3);
  assert.deepEqual(shards, [['c.tsx', 'd.tsx', 'e.tsx'], ['a.tsx'], ['b.tsx', 'new.tsx']]);
  const recorded = readDurations();
  const split = shardsOf(Object.keys(recorded), recorded, 3);
  assert.deepEqual(split.flat().sort(), Object.keys(recorded).sort());
});
