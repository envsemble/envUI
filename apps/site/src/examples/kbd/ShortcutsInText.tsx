import { Kbd, Text } from '@envsemble/envui';

export default function ShortcutsInText() {
  return (
    <Text>
      Press <Kbd keys={['Ctrl', 'P']} /> to open a document, or <Kbd>F2</Kbd> to rename it.
    </Text>
  );
}
