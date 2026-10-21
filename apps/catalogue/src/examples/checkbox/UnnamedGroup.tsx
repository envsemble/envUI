import { Checkbox, Column } from '@envsemble/envui';

export default function UnnamedGroup() {
  return (
    <Column gap={3}>
      <Checkbox name="notify" value="mentions" label="Mentions" defaultChecked />
      <Checkbox name="notify" value="comments" label="Comments" />
    </Column>
  );
}
