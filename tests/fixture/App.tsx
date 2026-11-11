import { useEffect, useLayoutEffect, useState } from 'react';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { FixtureMount, type FixtureModule } from './FixtureMount.js';
import { fixtureName } from './FixtureName.js';

/**
 * Each fixture's module by its name. The pages with an .html of their own render as their modules
 * load, so they are left out, as is the editor RichText.html shows, and CascadeLayers, whose
 * application style sheet would style every fixture.
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
  const module = fixtures.get(name ?? '');
  // The parts of another fixture, such as ContactSheetParts.fixture.tsx, have no default export.
  if (!module?.default) return <p>{`?fixture=${name} names no <Name>.fixture.tsx that mounts.`}</p>;
  const requested = parameters.get('scale');
  const scale = requested === 'compact' || requested === 'system' ? requested : 'comfortable';
  return <FixtureMount module={module} scale={scale} mounts={mounts} />;
}
