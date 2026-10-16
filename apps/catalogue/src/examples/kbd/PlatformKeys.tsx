import { Kbd, Text } from '@envsemble/envui';

/** Apple keyboards name the Command key; others use Ctrl for the same shortcuts. */
const apple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

export default function PlatformKeys() {
  return (
    <Text>
      Press <Kbd keys={[apple ? '⌘' : 'Ctrl', 'K']} /> to search, and{' '}
      <Kbd keys={apple ? ['⌘', '⇧', 'P'] : ['Ctrl', 'Shift', 'P']} /> to run a command.
    </Text>
  );
}
