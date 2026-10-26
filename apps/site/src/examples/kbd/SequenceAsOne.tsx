import { Kbd, Text } from '@envsemble/envui';

export default function SequenceAsOne() {
  return (
    <Text>
      Press <Kbd keys={['Ctrl', 'K', 'Ctrl', 'S']} /> to see every shortcut.
    </Text>
  );
}
