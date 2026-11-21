import { BaseSequencer, type TestSpecification } from 'vitest/node';
import { readDurations, shardsOf } from '../../../scripts/test/ComponentShards.ts';
import { repositoryPath } from '../../../scripts/RepositoryPaths.ts';

export class ShardByDuration extends BaseSequencer {
  override async shard(files: TestSpecification[]) {
    const { index, count } = this.ctx.config.shard!;
    const pathOf = (spec: TestSpecification) => repositoryPath(spec.moduleId);
    const shard = new Set(shardsOf(files.map(pathOf), readDurations(), count)[index - 1]);
    return files.filter((spec) => shard.has(pathOf(spec)));
  }
}
