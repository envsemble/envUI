import { Column, Disclosure, Text, TextField } from '@envsemble/envui';

export default function HiddenRules() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <TextField label="Project name" />
      <Disclosure title="Name rules">
        <Text>Use letters, numbers and spaces.</Text>
      </Disclosure>
    </Column>
  );
}
