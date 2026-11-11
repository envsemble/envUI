import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import type { ThemeScale } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import '../fixture/Fixture.css';
import { FixtureMount, type FixtureModule } from '../fixture/FixtureMount.tsx';

let root: Root | undefined;
let container: HTMLElement | undefined;

/**
 * Mounts a fixture module as the fixture page does (tests/fixture/App.tsx), in StrictMode in a
 * #root of the test's page. `search` is the query a fixture reads from location, as
 * `?fixture=<name>&<search>` gives it on the fixture page. `remount` mounts it afresh.
 */
export function mount(
  module: FixtureModule,
  { scale, search }: { scale?: ThemeScale; search?: string } = {},
) {
  unmount();
  if (search !== undefined) history.replaceState(null, '', `${location.pathname}?${search}`);
  container = document.createElement('div');
  container.id = 'root';
  document.body.append(container);
  const mounted = createRoot(container);
  root = mounted;
  let mounts = 0;
  // Rendered at once, so the fixture is in the page as mount() returns.
  const render = () =>
    flushSync(() =>
      mounted.render(
        <StrictMode>
          <FixtureMount module={module} scale={scale} mounts={mounts} />
        </StrictMode>,
      ),
    );
  render();
  return {
    remount: () => {
      mounts += 1;
      render();
    },
  };
}

/** Unmounts the fixture and takes its #root out of the page. */
export function unmount() {
  root?.unmount();
  container?.remove();
  root = undefined;
  container = undefined;
}
