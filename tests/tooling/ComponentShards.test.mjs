// How CI splits the component test files into shards (scripts/test/ComponentShards.ts): by the time
// each takes, the first shard starting with its build's share, a file without a record at the
// median, and every file in exactly one shard.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDurations, shardsOf } from '../../scripts/test/ComponentShards.ts';

test('shards split the files by their time, a new file at the median, each file once', () => {
  const durations = { 'a.tsx': 50, 'b.tsx': 30, 'c.tsx': 20, 'd.tsx': 10, 'e.tsx': 10 };
  // 140 s with the new file at the median, 20 s: the first shard starts with 14 s for its build,
  // and each file goes, longest first, to the shard with the least so far.
  const shards = shardsOf([...Object.keys(durations), 'new.tsx', 'a.tsx'], durations, 3);
  assert.deepEqual(shards, [['c.tsx', 'd.tsx', 'e.tsx'], ['a.tsx'], ['b.tsx', 'new.tsx']]);
  // The committed record puts every file it has in one shard.
  const recorded = readDurations();
  const split = shardsOf(Object.keys(recorded), recorded, 3);
  assert.deepEqual(split.flat().sort(), Object.keys(recorded).sort());
});
