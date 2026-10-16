import { Rating, Stack } from '@envsemble/envui';

export default function Scales() {
  return (
    <Stack gap={3} align="start">
      <Rating value={4} showValue />
      <Rating value={3.5} showValue />
      <Rating value={7} max={10} showValue />
    </Stack>
  );
}
