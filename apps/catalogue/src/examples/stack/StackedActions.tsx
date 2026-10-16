import { ActionGroup, Button, Stack, Surface, Text } from '@envsemble/envui';

export default function StackedActions() {
  return (
    // A narrow pane, such as on a phone, where the labels need the whole width.
    <Surface padding={5} render={<Stack gap={4} />} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Text as="h3" variant="section-heading">
        Leave the workspace?
      </Text>
      <Text>You lose access to its projects until someone invites you again.</Text>
      <ActionGroup stacked>
        <Button variant="destructive">Leave workspace</Button>
        <Button variant="secondary">Stay</Button>
      </ActionGroup>
    </Surface>
  );
}
