import { Column, Text } from '@envsemble/envui';

export default function TextFixture() {
  return (
    <Column gap={2} align="start" className="fixture-section">
      <Text tabularNumbers render={<span />} data-testid="tabular-ones">
        111111
      </Text>
      <Text tabularNumbers render={<span />} data-testid="tabular-eights">
        888888
      </Text>
      <Text render={<span />} data-testid="proportional">
        111111
      </Text>
    </Column>
  );
}
