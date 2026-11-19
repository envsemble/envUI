import { Button, Card, IconButton, Text } from '@envsemble/envui';
import { IconMoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

export default function CardAnatomy() {
  return (
    <Card
      title="Pricing research"
      meta="Updated yesterday"
      headerEnd={<IconButton variant="text" icon={<IconMoreHoriz />} aria-label="More actions" />}
      description="Interviews and survey results from twelve teams."
      actions={<Button>Open project</Button>}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    >
      <Text variant="caption">Owned by Priya Shah · 4 open tasks</Text>
    </Card>
  );
}
