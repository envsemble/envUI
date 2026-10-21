import { Button, List } from '@envsemble/envui';

export default function MixedActions() {
  return (
    <List.Root aria-label="Invitations" style={{ inlineSize: 'min(100%, 22rem)' }}>
      <List.Item
        label="Sam Lee"
        description="sam.lee@example.com"
        action={
          <Button variant="outline" size="sm">
            Resend
          </Button>
        }
      />
      <List.Item
        label="Priya Shah"
        description="priya.shah@example.com"
        action={
          <Button variant="text" size="sm" tone="danger">
            Cancel invitation
          </Button>
        }
      />
      <List.Item
        label="Alex Morgan"
        description="alex.morgan@example.com"
        action={<Button size="sm">Copy link</Button>}
      />
    </List.Root>
  );
}
