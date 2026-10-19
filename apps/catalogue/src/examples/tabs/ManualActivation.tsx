import { useEffect, useState } from 'react';
import { Button, Spinner, Tabs, Text } from '@envsemble/envui';

const reports = ['Revenue', 'Customers', 'Refunds'];

/** A report that loads once, the first time its tab is chosen, as from a server. */
function Report({ name, ready, onLoad }: { name: string; ready: boolean; onLoad: () => void }) {
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(onLoad, 800);
    return () => clearTimeout(timer);
  }, [ready, onLoad]);
  return ready ? (
    <Text>The {name.toLowerCase()} report for March is ready.</Text>
  ) : (
    <Spinner label={`Loading the ${name.toLowerCase()} report`} />
  );
}

export default function ManualActivation() {
  // The first report is ready; the others load when their tab is chosen.
  const [loaded, setLoaded] = useState(() => new Set(['Revenue']));
  return (
    <Tabs
      aria-label="Reports"
      activation="manual"
      items={reports.map((name) => ({
        value: name.toLowerCase(),
        button: <Button>{name}</Button>,
        content: (
          <Report
            name={name}
            ready={loaded.has(name)}
            onLoad={() => setLoaded((current) => new Set(current).add(name))}
          />
        ),
      }))}
    />
  );
}
