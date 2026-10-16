import { ActionGroup, Button } from '@envsemble/envui';

export default function Variants() {
  return (
    <ActionGroup>
      <Button>Continue</Button>
      <Button variant="important">Confirm</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outlined">Manage</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="text">Learn more</Button>
      <Button variant="quiet">Settings</Button>
    </ActionGroup>
  );
}
