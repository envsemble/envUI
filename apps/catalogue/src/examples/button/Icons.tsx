import { Button, IconButton, Stack } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function Icons() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Button startIcon={<Add />}>New section</Button>
      <Button variant="secondary" endIcon={<ChevronRight />}>
        Next step
      </Button>
      <IconButton icon={<Settings />} aria-label="Project settings" />
      <Button variant="outline" iconOnly icon={<Add />} aria-label="Add a member" />
    </Stack>
  );
}
