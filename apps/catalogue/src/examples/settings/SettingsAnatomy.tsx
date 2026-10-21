import { Button, Column, List, Switch, Text } from '@envsemble/envui';

export default function SettingsAnatomy() {
  return (
    <Column gap={6} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Column render={<section aria-labelledby="anatomy-privacy" />} gap={3}>
        <Text render={<h3 id="anatomy-privacy" />} variant="title">
          Privacy
        </Text>
        <List.Root aria-labelledby="anatomy-privacy">
          <List.Item
            label="Show me in the directory"
            description="Other people at Northwind can find you."
            action={<Switch aria-label="Show me in the directory" defaultChecked />}
          />
        </List.Root>
      </Column>
      <Column render={<section aria-labelledby="anatomy-danger" />} gap={3}>
        <Text render={<h3 id="anatomy-danger" />} variant="title">
          Delete workspace
        </Text>
        <Button variant="outline" tone="danger" style={{ alignSelf: 'start' }}>
          Delete workspace…
        </Button>
      </Column>
    </Column>
  );
}
