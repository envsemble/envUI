import { Kbd, Text } from '@envsemble/envui';

export default function ShortcutSequence() {
  return (
    <Text>
      Press <Kbd keys={['Ctrl', 'K']} /> then <Kbd keys={['Ctrl', 'S']} /> to see every shortcut.
    </Text>
  );
}
