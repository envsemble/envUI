import { Kbd, Text } from '@envsemble/envui';

/** A footer that names the keys of a list, one hint after another. */
const hints = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem' } as const;

export default function KeyHints() {
  return (
    <div style={hints}>
      <Text as="span" variant="caption">
        <Kbd>↑</Kbd> <Kbd>↓</Kbd> to move
      </Text>
      <Text as="span" variant="caption">
        <Kbd>Enter</Kbd> to open
      </Text>
      <Text as="span" variant="caption">
        <Kbd keys={['Ctrl', 'Enter']} /> to open in a new tab
      </Text>
      <Text as="span" variant="caption">
        <Kbd>Esc</Kbd> to close
      </Text>
    </div>
  );
}
