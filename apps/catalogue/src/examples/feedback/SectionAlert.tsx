import { useEffect, useRef, useState } from 'react';
import { Alert, Button, DescriptionList, Stack, Text } from '@envsemble/envui';

export default function SectionAlert() {
  const [requested, setRequested] = useState(false);
  const alert = useRef<HTMLDivElement>(null);
  // The button goes once the request is sent, so focus moves to the message that replaces it,
  // which reads its new text as it takes focus.
  useEffect(() => {
    if (requested) alert.current?.focus();
  }, [requested]);
  return (
    <Stack gap={5}>
      <Text render={<h3 />} variant="title">
        Quarterly report
      </Text>
      {/* A condition of the page, there when it loads: it stays until the condition changes, and
          is read with the page rather than announced. A warning Alert has no role without
          `announce`, so its change is read once, with focus; an info Alert, a status message,
          would announce it a second time. */}
      <Alert
        ref={alert}
        tabIndex={-1}
        tone="warning"
        title="This project is read-only"
        action={
          requested ? undefined : (
            <Button variant="secondary" size="sm" onClick={() => setRequested(true)}>
              Request edit access
            </Button>
          )
        }
      >
        {requested
          ? 'Request sent to Alex Morgan. You’ll get an email when they answer.'
          : 'Ask Alex Morgan, its owner, for edit access to change it.'}
      </Alert>
      <DescriptionList.Root aria-label="Project details">
        <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
        <DescriptionList.Item label="Status">In progress</DescriptionList.Item>
        <DescriptionList.Item label="Due">31 March 2026</DescriptionList.Item>
      </DescriptionList.Root>
    </Stack>
  );
}
