import { Rating, Column, Text } from '@envsemble/envui';

export default function ReviewScore() {
  return (
    <Column gap={2} align="start">
      <Text render={<h3 />} variant="title">
        Northwind Studio
      </Text>
      <Rating value={4.5} showValue />
      <Text variant="body-sm">Average of 128 reviews</Text>
    </Column>
  );
}
