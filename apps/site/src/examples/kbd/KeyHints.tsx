import { Kbd, Row, Text } from '@envsemble/envui';

export default function KeyHints() {
  return (
    <Row wrap gap={4}>
      <Text render={<span />} variant="caption">
        <Kbd>↑</Kbd> <Kbd>↓</Kbd> to move
      </Text>
      <Text render={<span />} variant="caption">
        <Kbd>Enter</Kbd> to open
      </Text>
      <Text render={<span />} variant="caption">
        <Kbd>Esc</Kbd> to close
      </Text>
    </Row>
  );
}
