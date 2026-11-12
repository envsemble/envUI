import { Fragment, type ComponentType } from 'react';
import { Theme, type ColorScheme, type ThemeScale } from '@envsemble/envui';

/**
 * A fixture module, `<Name>.fixture.tsx`: its fixture as the default export and, where they differ
 * from the default, how it mounts.
 */
export interface FixtureModule {
  default: ComponentType<{ theme: ColorScheme }>;
  /** Mounted once per theme, light then dark, each given as `theme`; by default once, in light. */
  themes?: boolean;
  /**
   * By default the fixture mounts in the host page, in a light Theme's main beside content of the
   * host's own. `standalone` mounts it in the Theme alone, as a fixture that fills the viewport or
   * needs it to itself; `root` outside any Theme too, as one that themes the document through its
   * own provider, as an application does.
   */
  mount?: 'standalone' | 'root';
}

/**
 * A fixture mounted as its module says, in a scale. The fixture page (App.tsx) and the component
 * tests (tests/component/support/Mount.tsx) both mount through it; `mounts` keys a fresh mount.
 */
export function FixtureMount({
  module: { default: Fixture, themes, mount },
  scale = 'comfortable',
  mounts = 0,
}: {
  module: FixtureModule;
  scale?: ThemeScale;
  mounts?: number;
}) {
  const fixture = themes ? (
    <Fragment key={mounts}>
      <Fixture theme="light" />
      <Fixture theme="dark" />
    </Fragment>
  ) : (
    <Fixture key={mounts} theme="light" />
  );
  if (mount === 'root') return fixture;
  if (mount === 'standalone')
    return (
      <Theme theme="light" scale={scale}>
        {fixture}
      </Theme>
    );
  return (
    <>
      <p data-testid="host-marker">Host document marker</p>
      <Theme theme="light" scale={scale}>
        <main className="fixture-main">{fixture}</main>
      </Theme>
    </>
  );
}
