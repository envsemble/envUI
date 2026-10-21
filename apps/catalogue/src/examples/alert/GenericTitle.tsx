import { Alert, Button } from '@envsemble/envui';

export default function GenericTitle() {
  return (
    <Alert
      tone="warning"
      title="Warning"
      action={<Button variant="secondary">Click here</Button>}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      Please be advised that an issue has occurred.
    </Alert>
  );
}
