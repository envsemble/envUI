import { Fragment, useEffect, useLayoutEffect, useState, type ComponentType } from 'react';
import { Theme, type ColorScheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { fixtureName } from './FixtureName.js';

/**
 * A fixture module, `<Name>.fixture.tsx`: its fixture as the default export and, where they differ
 * from the default, how App mounts it.
 */
interface FixtureModule {
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
 * Each fixture's module by its name. The pages with an .html of their own render as their modules
 * load, so they are left out, as is the editor RichText.html shows.
 */
const fixtures = new Map(
  Object.entries(
    import.meta.glob<FixtureModule>(
      ['./*.fixture.tsx', '!./{CascadeLayers,ForcedColors,RichText,RichTextEditor}.fixture.tsx'],
      { eager: true },
    ),
  ).map(([file, module]) => [fixtureName(file), module]),
);

/**
 * The fixture `?fixture=<name>` names, in the scale `?scale=compact` or `?scale=system` sets,
 * otherwise comfortable whatever the pointer, so a spec measures the same sizes in every browser.
 * A `fixture-remount` event on the window mounts it afresh, as a spec that checks what a component
 * does on a later mount in the same page dispatches; the root's data-fixture-mounts counts the
 * mounts once each is in the page.
 */
export default function App() {
  const [mounts, setMounts] = useState(0);
  useEffect(() => {
    const remount = () => setMounts((count) => count + 1);
    window.addEventListener('fixture-remount', remount);
    return () => window.removeEventListener('fixture-remount', remount);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.dataset.fixtureMounts = String(mounts);
  }, [mounts]);
  const parameters = new URLSearchParams(location.search);
  const name = parameters.get('fixture');
  const { default: Fixture, themes, mount } = fixtures.get(name ?? '') ?? {};
  // The parts of another fixture, such as ContactSheetParts.fixture.tsx, have no default export.
  if (!Fixture) return <p>{`?fixture=${name} names no <Name>.fixture.tsx that mounts.`}</p>;
  const fixture = themes ? (
    <Fragment key={mounts}>
      <Fixture theme="light" />
      <Fixture theme="dark" />
    </Fragment>
  ) : (
    <Fixture key={mounts} theme="light" />
  );
  if (mount === 'root') return fixture;
  const requested = parameters.get('scale');
  const scale = requested === 'compact' || requested === 'system' ? requested : 'comfortable';
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
