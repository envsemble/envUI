import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, Link, Page, Stack, Text } from '@envsemble/envui';
import { Lock } from '@envsemble/envui/icons/Lock';

/**
 * The page for an object people may not open, inside the app frame: what it is, who can give them
 * access, and a request they can send. Render it when your service refuses the object.
 */
export default function NoAccessPage() {
  const [requested, setRequested] = useState(false);
  const [sending, setSending] = useState(false);
  const confirmation = useRef<HTMLElement>(null);
  // The button people pressed goes, so focus moves to the status that replaces it, which reads it.
  useEffect(() => {
    if (requested) confirmation.current?.focus();
  }, [requested]);
  const request = () => {
    if (sending) return;
    setSending(true);
    // The request goes to your service, which tells the owner; a timer stands in for it.
    window.setTimeout(() => {
      setSending(false);
      setRequested(true);
    }, 800);
  };
  return (
    <Page width="md">
      <EmptyState
        align="center"
        headingLevel={1}
        icon={<Lock />}
        title="You don’t have access to this project"
        description={`${project.name} is shared only with its members. Ask ${project.owner}, its owner, to add you, or request access.`}
        action={
          <Stack align="center" gap={3}>
            {requested ? null : (
              // Pending, never disabled, while the request is sent.
              <Button pending={sending} onClick={request}>
                Request access
              </Button>
            )}
            <Text ref={confirmation} tabIndex={-1} role="status" emphasis="muted">
              {requested ? `Request sent. ${project.owner} will get an email.` : ''}
            </Text>
            <Link href="/projects">Go to projects</Link>
          </Stack>
        }
      />
    </Page>
  );
}

const project = { name: 'Quarterly report', owner: 'Priya Shah' };
