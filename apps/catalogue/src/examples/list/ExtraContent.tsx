import { Badge, Button, List } from '@envsemble/envui';

export default function ExtraContent() {
  return (
    <List.Root aria-label="Invitations">
      <List.Item
        title="Sam Lee"
        detail="sam.lee@example.com"
        action={<Button variant="outlined">Resend</Button>}
      >
        {/* Children follow the title and detail, such as a status. */}
        <Badge tone="warning">Expires tomorrow</Badge>
      </List.Item>
      <List.Item
        title="Jordan Ellis"
        detail="jordan.ellis@example.com"
        action={<Button variant="outlined">Resend</Button>}
      >
        <Badge>Sent today</Badge>
      </List.Item>
    </List.Root>
  );
}
