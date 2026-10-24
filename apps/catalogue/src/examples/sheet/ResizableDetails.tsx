import { Button, Column, Sheet, Text } from '@envsemble/envui';

export default function ResizableDetails() {
  return (
    <Sheet
      title="Northwind launch"
      description="Active · Priya Shah"
      // People drag its start edge, or move it with the arrow keys, for a wider or narrower view.
      resizable
      minWidth={20}
      maxWidth={48}
      trigger={<Button variant="secondary">Project details</Button>}
    >
      <Column gap={3}>
        <Text>
          The launch moves the product page, the help center and the release notes to the new site
          on the same day.
        </Text>
        <Text emphasis="muted">Due on 14 November · 12 open tasks</Text>
      </Column>
    </Sheet>
  );
}
