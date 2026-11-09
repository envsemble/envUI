/// <reference types="vite/client" />
import { Component, Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react';
import { Column, Theme, ThemePreferenceProvider } from '@envsemble/envui';
import { layout } from '@envsemble/envui/dev';
// The catalogue's stage, so an example sits as its figure does: centred, kept to the stage's width,
// and filling it where it takes its width from its container. Fixture.css takes away the stage's
// padding and frame, so the stage is the window the example gets.
import '../../apps/site/src/figures/Stage.css';
import '../../apps/site/src/figures/MotionStage.css';

export const mount = 'standalone';

/**
 * Every catalogue example file, loaded on demand: apps/site/src/examples/<page>/<Name>.tsx,
 * as the catalogue's example registry loads them (ExampleRegistry.ts).
 */
const loaders = import.meta.glob<{ default: ComponentType }>(
  '../../apps/site/src/examples/*/*.tsx',
);
const params = new URLSearchParams(window.location.search);
const path = `../../apps/site/src/examples/${params.get('page')}/${params.get('name')}.tsx`;
/** The example the address names, if there is one. */
const Example = loaders[path] && lazy(loaders[path]);
/**
 * The theme `&theme=light` or `&theme=dark` asks for, for the visual baseline's open lists: the
 * example then sits on the catalogue's canvas, padding and fill kept, on a page of that theme.
 */
const theme = (['light', 'dark'] as const).find((value) => value === params.get('theme'));

/** Shows an example that throws as its error, which the spec reports. */
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

/** Marks the root once the example has rendered, past its Suspense. */
function Rendered() {
  useEffect(() => {
    document.querySelector('[data-testid="layout-check-root"]')?.setAttribute('data-rendered', '');
  }, []);
  return null;
}

/**
 * One catalogue example on its own, for LayoutCheck.spec.ts: `?fixture=layout-check&page=<page>
 * &name=<Name>`, in the catalogue's stage, which is the `env-window` container. Its overlays open
 * into the document, as an application's do, so they are placed against the real window. Dev
 * mode's readout is `window.envui.layout`. A theme preference, which some examples read and set,
 * is the fixture's own, as the catalogue's is, and leaves the document alone. With `&theme=`, the
 * visual baseline (tests/visual) opens the lists of examples the catalogue only plays.
 */
export default function LayoutCheckFixture() {
  useEffect(() => {
    const envui = window.envui ?? (window.envui = {});
    envui.layout = layout;
  }, []);
  if (!Example) return <pre data-example-error="">No example file {path}</pre>;
  const stage = (
    <Column
      container="env-window"
      gap={0}
      className={theme ? 'site-live-example' : 'site-live-example fixture-layout-check'}
      data-testid="layout-check-root"
    >
      <ExampleError>
        <Suspense fallback={null}>
          <Example />
          <Rendered />
        </Suspense>
      </ExampleError>
    </Column>
  );
  return (
    <ThemePreferenceProvider
      applyToDocument={false}
      defaultPreference="light"
      storageKey="envui-layout-check-theme"
    >
      {theme ? (
        <Theme theme={theme} className="fixture-layout-check-page">
          {stage}
        </Theme>
      ) : (
        stage
      )}
    </ThemePreferenceProvider>
  );
}
