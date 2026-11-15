import { Badge, Button, List } from '@envsemble/envui';

export default function ExtraContent() {
  return (
    <List.Root aria-label="Invitations">
      <List.Item
        label="Sam Lee"
        description="sam.lee@example.com"
        end={<Button variant="outline">Resend</Button>}
      >
        <Badge tone="warning">Expires tomorrow</Badge>
      </List.Item>
      <List.Item
        label="Jordan Ellis"
        description="jordan.ellis@example.com"
        end={<Button variant="outline">Resend</Button>}
      >
        <Badge>Sent today</Badge>
      </List.Item>
    </List.Root>
  );
}
