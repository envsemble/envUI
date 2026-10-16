import { Rating, Stack, Text } from '@envsemble/envui';

export default function ReviewScore() {
  return (
    <Stack gap={2} align="start">
      <Text render={<h3 />} variant="title">
        Northwind Studio
      </Text>
      <Rating value={4.5} showValue />
      <Text variant="body-sm">Average of 128 reviews</Text>
    </Stack>
  );
}
