import { useEffect, useRef, useState } from 'react';
import { Button, Column, Surface, Text } from '@envsemble/envui';
import { IconLock } from '@envsemble/envui/icons/Lock';

export default function NoAccess() {
  const [requested, setRequested] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  // The button goes once the request is sent, so focus moves to the state that now says so.
  useEffect(() => {
    if (requested) region.current?.focus();
  }, [requested]);

  return (
    <Column gap={4}>
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
        {/* Centred in the room the documents would take, with a larger icon. */}
        <Column gap={4} padding={5} align="center" justify="center" style={{ textAlign: 'center' }}>
          <Text render={<span />} emphasis="muted">
            <IconLock width="2.5rem" height="2.5rem" />
          </Text>
          <Column gap={2} align="center" style={{ maxInlineSize: '30rem' }}>
            <Text render={<h4 />} variant="title">
              You don’t have access to this project
            </Text>
            <Text variant="body-sm">
              {requested
                ? 'Request sent to Priya Shah. You’ll get an email when they answer.'
                : 'Ask Priya Shah, its owner, for access to see its documents.'}
            </Text>
          </Column>
          {!requested && (
            <Button variant="secondary" onClick={() => setRequested(true)}>
              Request access
            </Button>
          )}
        </Column>
      </Surface>
    </Column>
  );
}
