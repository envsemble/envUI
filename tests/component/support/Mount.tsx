import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import type { ThemeScale } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import '../../fixture/Fixture.css';
import { FixtureMount, type FixtureModule } from '../../fixture/FixtureMount.tsx';

let root: Root | undefined;
let container: HTMLElement | undefined;

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

export function unmount() {
  root?.unmount();
  container?.remove();
  root = undefined;
  container = undefined;
}
