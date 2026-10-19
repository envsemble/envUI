import { Rating, Stack, Text } from '@envsemble/envui';

const reviews = [
  {
    author: 'Alex Morgan',
    rating: 5,
    text: 'Clear onboarding, and support answered within the hour.',
  },
  { author: 'Sam Lee', rating: 4, text: 'Reliable day to day; exports could be faster.' },
  {
    author: 'Priya Shah',
    rating: 3.5,
    text: 'Good value, though the reports take some setting up.',
  },
];

export default function ReviewList() {
  return (
    <Stack gap={5}>
      {reviews.map((review) => (
        <Stack render={<article />} gap={1} key={review.author}>
          <Text render={<h3 />} variant="body-sm">
            {review.author}
          </Text>
          <Rating value={review.rating} />
          <Text>{review.text}</Text>
        </Stack>
      ))}
    </Stack>
  );
}
