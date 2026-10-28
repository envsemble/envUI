import { Rating } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/* The score as reviews come in, a half star at a time, down and up again. */
const scores = [4.5, 4, 3.5, 4, 4.5, 5];

/** A rating of four and a half stars, with its number. */
export default function RatingTile() {
  const value = scores[useTimeline([900, 500, 700, 500, 500, 900])]!;
  return <Rating value={value} showValue />;
}
