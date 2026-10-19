import { ActionGroup, Button } from '@envsemble/envui';

export function SpreadActions({ group, save }) {
  return (
    <>
      <ActionGroup {...group}>
        <Button>Save</Button>
      </ActionGroup>
      <ActionGroup stacked>
        <Button {...save}>Save</Button>
        <Button>Cancel</Button>
      </ActionGroup>
    </>
  );
}
