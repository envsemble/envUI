import { Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

export default function ButtonAnatomy() {
  return (
    <Button startIcon={<Add />} endIcon={<ChevronRight />}>
      Create project
    </Button>
  );
}
