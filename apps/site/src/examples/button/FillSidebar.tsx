import { Button, ButtonGroup, Column, IconButton, Surface, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ExpandMore } from '@envsemble/envui/icons/ExpandMore';

const documents = ['Launch plan', 'Q3 notes', 'Hiring brief'];

export default function FillSidebar() {
  return (
    // A sidebar: the group fills its width, above the documents.
    <Surface
      background="page"
      padding={4}
      render={<Column gap={5} />}
      style={{ inlineSize: 'min(100%, 16rem)' }}
    >
      <ButtonGroup fullWidth aria-label="Start a document">
        <Button startIcon={<Add />}>New document</Button>
        <IconButton variant="primary" icon={<ExpandMore />} aria-label="More ways to start" />
      </ButtonGroup>
      <Column gap={3}>
        <Text variant="caption" emphasis="muted">
          Recent
        </Text>
        {documents.map((name) => (
          <Text key={name}>{name}</Text>
        ))}
      </Column>
    </Surface>
  );
}
