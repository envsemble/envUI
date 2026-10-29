import { Button, IconButton, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function Icons() {
  return (
    <Row wrap align="center" gap={4}>
      <Button startIcon={<IconAdd />}>New section</Button>
      <Button variant="secondary" endIcon={<IconChevronRight />}>
        Next step
      </Button>
      <IconButton icon={<IconSettings />} aria-label="Project settings" />
      <IconButton variant="outline" icon={<IconAdd />} aria-label="Add a member" />
    </Row>
  );
}
