import { Button } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconChevronRight } from '@envsemble/envui/icons/ChevronRight';

export default function ButtonAnatomy() {
  return (
    <Button startIcon={<IconAdd />} endIcon={<IconChevronRight />}>
      Create project
    </Button>
  );
}
