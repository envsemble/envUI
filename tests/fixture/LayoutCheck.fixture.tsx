/// <reference types="vite/client" />
import { Component, Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react';
import { Column, Theme, ThemePreferenceProvider } from '@envsemble/envui';
import '../../apps/site/src/figures/Stage.css';
import '../../apps/site/src/figures/MotionStage.css';

export const mount = 'standalone';

const loaders = import.meta.glob<{ default: ComponentType }>(
  '../../apps/site/src/examples/*/*.tsx',
);
const params = new URLSearchParams(window.location.search);
const path = `../../apps/site/src/examples/${params.get('page')}/${params.get('name')}.tsx`;
const Example = loaders[path] && lazy(loaders[path]);
const theme =
  (['light', 'dark'] as const).find((value) => value === params.get('theme')) ?? 'light';

class ExampleError extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    const { error } = this.state;
    return error ? (
      <pre data-example-error="">{String(error.stack ?? error)}</pre>
    ) : (
      this.props.children
    );
  }
}

function Rendered() {
  useEffect(() => {
    document.querySelector('[data-testid="layout-check-root"]')?.setAttribute('data-rendered', '');
  }, []);
  return null;
}

export default function LayoutCheckFixture() {
  if (!Example) return <pre data-example-error="">No example file {path}</pre>;
  return (
    <ThemePreferenceProvider defaultPreference="light" applyToDocument={false}>
      <Theme theme={theme} className="fixture-layout-check-page">
        <Column
          container="env-window"
          gap={0}
          className="site-live-example"
          data-testid="layout-check-root"
        >
          <ExampleError>
            <Suspense fallback={null}>
              <Example />
              <Rendered />
            </Suspense>
          </ExampleError>
        </Column>
      </Theme>
    </ThemePreferenceProvider>
  );
}
