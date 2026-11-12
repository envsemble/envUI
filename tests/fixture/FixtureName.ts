/**
 * A fixture's name, `?fixture=<name>`: its file's name in kebab case, as `ButtonGroup.fixture.tsx`
 * is `button-group`. App.tsx mounts fixtures by it and scripts/test/FixtureImports.ts finds the
 * fixtures a spec opens by it.
 */
export const fixtureName = (file: string) =>
  file
    .replace(/^.*\//, '')
    .replace(/\.fixture\.tsx$/, '')
    .replace(/(?<=[a-z0-9])(?=[A-Z])/g, '-')
    .toLowerCase();
