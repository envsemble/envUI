import { Column, Rating, Text } from '@envsemble/envui';

export default function ReviewList() {
  return (
    <Column gap={1} align="start">
      <Text render={<h3 />} variant="body-sm">
        Alex Morgan
      </Text>
      <Rating value={5} />
      <Text>Clear onboarding, and support answered within the hour.</Text>
    </Column>
  );
}
