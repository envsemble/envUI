import { Rating, Column } from '@envsemble/envui';

export default function Scales() {
  return (
    <Column gap={3} align="start">
      <Rating value={4} />
      <Rating value={3.5} showValue />
      <Rating value={7} max={10} showValue />
    </Column>
  );
}
