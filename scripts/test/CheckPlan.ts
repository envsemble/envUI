import { checks } from './StaticChecks.ts';
import { isComponentTest } from './FixtureImports.ts';
import { selectScope, specFile, specNeeds, unitTestFiles } from './TestScope.ts';
import { bin, task, type Task } from './TestTasks.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const windowsCommandLineRoomForPaths = 24_000;
const tooLong = (paths: readonly string[]) =>
  paths.reduce((length, path) => length + path.length + 1, 0) > windowsCommandLineRoomForPaths;

interface PlanOptions {
  affected?: boolean;
  base?: string;
  root?: string;
}

export function planCheck(
  paths: readonly string[],
  { affected = false, base, root = repositoryRoot }: PlanOptions = {},
) {
  const scope = selectScope(paths, { affected, root });
  if (tooLong(scope.lint)) scope.whole.lint = true;
  if (tooLong(scope.css)) scope.whole.css = true;
  if (tooLong(scope.format)) scope.whole.format = true;
  const unitTests = unitTestFiles(root);
  if (paths.some((path) => unitTests.built.includes(path))) scope.build.library = true;

  const needs = new Map([...scope.specs.keys()].map((name) => [name, specNeeds(name, root)]));
  const live = [...needs].filter(([, need]) => need.live).map(([name]) => name);
  const browserSpecs = [...needs]
    .filter(([, need]) => !need.live && (affected || !need.library))
    .map(([name]) => name);
  const deferred = affected ? [] : [...needs.keys()].filter((name) => !browserSpecs.includes(name));
  const componentTests = browserSpecs.filter((name) => isComponentTest(specFile(name, root)));
  const playwrightSpecs = browserSpecs.filter((name) => !componentTests.includes(name));
  const builds = {
    library: affected && scope.build.library,
    site: [...needs].some(([name, need]) => need.site && playwrightSpecs.includes(name)),
  };

  const staticTasks: Task[] = [
    ...(scope.whole.lint ? checks.lint() : scope.lint.length ? checks.lint(scope.lint) : []),
    ...(scope.whole.lint || scope.lint.length ? checks['lint:unused']() : []),
    ...(scope.whole.css
      ? checks['lint:css']()
      : scope.css.length
        ? checks['lint:css'](scope.css)
        : []),
    ...(scope.whole.format
      ? checks['format:check']()
      : scope.format.length
        ? checks['format:check'](scope.format)
        : []),
    ...(scope.typecheck ? checks.typecheck() : []),
    ...(scope.generated.has('tokens') ? checks['tokens:check']() : []),
    ...(scope.generated.has('docs') ? checks['docs:check'](base) : []),
    ...(scope.generated.has('icons') ? checks['icons:check']() : []),
    task('unit tests', [...bin.node, '--test', ...unitTests.fast], {
      detail: `${unitTests.fast.length} files`,
    }),
  ];

  return {
    scope,
    staticTasks,
    unitTests,
    browserSpecs,
    componentTests,
    playwrightSpecs,
    live,
    deferred,
    builds,
  };
}
