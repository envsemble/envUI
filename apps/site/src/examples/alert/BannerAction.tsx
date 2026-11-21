import { Alert, Button, Code } from '@envsemble/envui';

export default function BannerAction() {
  return (
    <Alert
      tone="warning"
      title={
        <>
          Deploy of <Code>main</Code> paused
        </>
      }
      actionsPlacement="end"
      actions={<Button variant="secondary">Resume</Button>}
      style={{ inlineSize: 'min(100%, 40rem)' }}
    >
      A required check is still running.
    </Alert>
  );
}
