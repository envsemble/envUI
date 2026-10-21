import { Column, Rating, Text } from '@envsemble/envui';

export default function WhoRated() {
  return (
    <Column gap={1} align="start">
      <Text render={<h3 />} variant="title">
        Harbour Print Co.
      </Text>
      <Rating value={4} showValue />
      <Text variant="body-sm" emphasis="muted">
        Average of 56 reviews
      </Text>
    </Column>
  );
}
