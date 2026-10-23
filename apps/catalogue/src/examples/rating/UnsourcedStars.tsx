import { Column, Rating, Text } from '@envsemble/envui';

export default function UnsourcedStars() {
  return (
    <Column gap={1} align="start">
      <Text render={<h3 />} variant="title">
        Harbour Print Co.
      </Text>
      <Rating value={4} showValue />
    </Column>
  );
}
