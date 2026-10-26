import { Column, Disclosure, Text, TextField } from '@envsemble/envui';

export default function OptionalHelp() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <TextField label="Project name" description="Use letters, numbers and spaces." />
      <Disclosure title="Where the name appears">
        <Text>In the sidebar, in links you share and at the top of every page.</Text>
      </Disclosure>
    </Column>
  );
}
