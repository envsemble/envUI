import { Button, ButtonGroup, IconButton } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ExpandMore } from '@envsemble/envui/icons/ExpandMore';

export default function FillSidebar() {
  return (
    // As wide as a sidebar.
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <ButtonGroup fullWidth aria-label="Start a document">
        <Button startIcon={<Add />}>New document</Button>
        <IconButton variant="primary" icon={<ExpandMore />} aria-label="More ways to start" />
      </ButtonGroup>
    </div>
  );
}
