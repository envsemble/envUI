import { ActionGroup, Button, IconButton } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function Icons() {
  return (
    <ActionGroup>
      <Button startIcon={<Add />}>New section</Button>
      <Button variant="secondary" endIcon={<ChevronRight />}>
        Next step
      </Button>
      <IconButton icon={<Settings />} aria-label="Project settings" />
      <Button variant="outlined" iconOnly icon={<Add />} aria-label="Add a member" />
    </ActionGroup>
  );
}
