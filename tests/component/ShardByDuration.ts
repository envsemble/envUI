import { relative, sep } from 'node:path';
import { BaseSequencer, type TestSpecification } from 'vitest/node';
import { readDurations, shardsOf } from '../../scripts/test/ComponentShards.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

/** Vitest's sequencer, with `--shard` split by the time each file takes (ComponentShards.ts). */
export class ShardByDuration extends BaseSequencer {
  override async shard(files: TestSpecification[]) {
    const { index, count } = this.ctx.config.shard!;
    const pathOf = (spec: TestSpecification) =>
      relative(repositoryRoot, spec.moduleId).replaceAll(sep, '/');
    const shard = new Set(shardsOf(files.map(pathOf), readDurations(), count)[index - 1]);
    return files.filter((spec) => shard.has(pathOf(spec)));
  }
}
