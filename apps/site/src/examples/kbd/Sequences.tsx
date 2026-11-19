import { Kbd, Text } from '@envsemble/envui';

export default function Sequences() {
  return (
    <Text>
      Press <Kbd keys={['G', 'I']} separator=" then " /> to open the inbox, and{' '}
      <Kbd keys={['⌘', '⇧', 'P']} separator={null} /> to run a command.
    </Text>
  );
}
