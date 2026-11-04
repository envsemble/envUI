import { Kbd, Text, useModifierKey } from '@envsemble/envui';

export default function PlatformKeys() {
  const modifier = useModifierKey();
  return (
    <Text>
      Press <Kbd keys={[modifier.label, 'K']} /> to search, and{' '}
      <Kbd keys={[modifier.label, modifier.key === 'Meta' ? '⇧' : 'Shift', 'P']} /> to run a
      command.
    </Text>
  );
}
