import { useEffect, useLayoutEffect, useState } from 'react';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { FixtureMount, type FixtureModule } from './FixtureMount.js';
import { fixtureName } from './FixtureName.js';

const fixtures = new Map(
  Object.entries(
    import.meta.glob<FixtureModule>(['./*.fixture.tsx', '!./CascadeLayers.fixture.tsx'], {
      eager: true,
    }),
  ).map(([file, module]) => [fixtureName(file), module]),
);

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
  if (!module?.default) return <p>{`?fixture=${name} names no <Name>.fixture.tsx that mounts.`}</p>;
  const requested = parameters.get('scale');
  const scale = requested === 'compact' || requested === 'system' ? requested : 'comfortable';
  return <FixtureMount module={module} scale={scale} mounts={mounts} />;
}
