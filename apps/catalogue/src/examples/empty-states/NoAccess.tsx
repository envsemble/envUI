import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, Stack, Surface, Text } from '@envsemble/envui';
import { Lock } from '@envsemble/envui/icons/Lock';

export default function NoAccess() {
  const [requested, setRequested] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  // The button goes once the request is sent, so focus moves to the state that now says so.
  useEffect(() => {
    if (requested) region.current?.focus();
  }, [requested]);

  return (
    <Stack gap={4}>
      <Text render={<h3 />} variant="title">
        Annual review
      </Text>
      {/* envUI has no region height for an example: the surface gives the state the space the
          project's documents would take. */}
      <Surface
        ref={region}
        tabIndex={-1}
        background="default"
        padding={0}
        style={{ display: 'grid', minBlockSize: '16rem' }}
      >
        <EmptyState
          align="center"
          icon={<Lock />}
          title="You don’t have access to this project"
          description={
            requested
              ? 'Request sent to Priya Shah. You’ll get an email when they answer.'
              : 'Ask Priya Shah, its owner, for access to see its documents.'
          }
          action={
            requested ? undefined : (
              <Button variant="secondary" onClick={() => setRequested(true)}>
                Request access
              </Button>
            )
          }
        />
      </Surface>
    </Stack>
  );
}
