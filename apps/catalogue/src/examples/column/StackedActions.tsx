import { Button, Column, Surface, Text } from '@envsemble/envui';

export default function StackedActions() {
  return (
    // A narrow pane, such as on a phone, where the labels need the whole width.
    <Surface padding={5} render={<Column gap={4} />} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Text render={<h3 />} variant="title">
        Leave the workspace?
      </Text>
      <Text>You lose access to its projects until someone invites you again.</Text>
      <Column gap={2}>
        <Button variant="primary" tone="danger" fullWidth>
          Leave workspace
        </Button>
        <Button variant="secondary" fullWidth>
          Stay
        </Button>
      </Column>
    </Surface>
  );
}
