import { Fragment, type ComponentType } from 'react';
import { Theme, type ColorScheme, type ThemeScale } from '@envsemble/envui';

export interface FixtureModule {
  default: ComponentType<{ theme: ColorScheme }>;
  themes?: boolean;
  mount?: 'standalone' | 'root';
}

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
