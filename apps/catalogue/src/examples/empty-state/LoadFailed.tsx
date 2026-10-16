import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, List } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function LoadFailed() {
  const [status, setStatus] = useState<'failed' | 'loading' | 'loaded'>('failed');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const retry = () => {
    setStatus('loading');
    // Stands in for loading the list again.
    timer.current = window.setTimeout(() => setStatus('loaded'), 800);
  };
  if (status === 'loaded')
    return (
      <List.Root aria-label="Projects">
        <List.Item title="Northwind launch" detail="Updated today" />
        <List.Item title="Pricing research" detail="Updated yesterday" />
      </List.Root>
    );
  return (
    <EmptyState
      tone="error"
      title="Projects couldn’t load"
      description="The server didn’t respond. Your projects are safe; try again in a moment."
      action={
        <Button
          variant="secondary"
          startIcon={<Refresh />}
          pending={status === 'loading'}
          onClick={retry}
        >
          Try again
        </Button>
      }
    />
  );
}
