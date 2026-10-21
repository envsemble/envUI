import { Column, Rating, Text } from '@envsemble/envui';

export default function RepeatedRating() {
  return (
    <Column gap={1} align="start">
      <Text render={<h3 />} variant="body-sm">
        Alex Morgan
      </Text>
      <Rating value={5} showValue />
      <Text>Rated 5 out of 5. Clear onboarding, and support answered within the hour.</Text>
    </Column>
  );
}
