import { useEffect, useRef, useState } from 'react';
import { Button, Column, TopBar } from '@envsemble/envui';

export default function LoadingPage() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Column gap={4} align="start">
      <TopBar title="Northwind" loading={loading} loadingLabel="Loading Projects" />
      <Button
        variant="secondary"
        onClick={() => {
          setLoading(true);
          // The next page loads from a server; a timer stands in for it here.
          timer.current = window.setTimeout(() => setLoading(false), 1500);
        }}
      >
        Open Projects
      </Button>
    </Column>
  );
}
