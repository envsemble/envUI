import { Checkbox, Column, Text } from '@envsemble/envui';

export default function NamedGroup() {
  return (
    <Column render={<fieldset />} gap={3} style={{ margin: 0, padding: 0, border: 0 }}>
      <Text render={<legend />} variant="body-sm" style={{ padding: 0, marginBlockEnd: '0.75rem' }}>
        Send me an e-mail about
      </Text>
      <Checkbox name="notify" value="mentions" label="Mentions" defaultChecked />
      <Checkbox name="notify" value="comments" label="Comments" />
    </Column>
  );
}
