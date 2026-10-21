import { Button, IconButton, Row } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function Icons() {
  return (
    <Row wrap align="center" gap={4}>
      <Button startIcon={<Add />}>New section</Button>
      <Button variant="secondary" endIcon={<ChevronRight />}>
        Next step
      </Button>
      <IconButton icon={<Settings />} aria-label="Project settings" />
      <IconButton variant="outline" icon={<Add />} aria-label="Add a member" />
    </Row>
  );
}
