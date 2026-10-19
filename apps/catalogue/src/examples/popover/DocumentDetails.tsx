import { Button, Popover, Stack, Text } from '@envsemble/envui';
import { Info } from '@envsemble/envui/icons/Info';

export default function DocumentDetails() {
  return (
    <Stack align="start">
      <Popover
        title="Launch plan.md"
        trigger={
          <Button variant="secondary" startIcon={<Info />}>
            Details
          </Button>
        }
      >
        <Text emphasis="muted">Changed today by Alex Morgan. 3 open decisions, 1 blocked.</Text>
        <Text emphasis="muted">Shared with everyone at Northwind.</Text>
      </Popover>
    </Stack>
  );
}
