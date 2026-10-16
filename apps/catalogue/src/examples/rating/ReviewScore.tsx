import { Rating, Stack, Text } from '@envsemble/envui';

export default function ReviewScore() {
  return (
    <Stack gap={2} align="start">
      <Text as="h3" variant="section-heading">
        Northwind Studio
      </Text>
      <Rating value={4.5} showValue />
      <Text variant="supporting">Average of 128 reviews</Text>
    </Stack>
  );
}
