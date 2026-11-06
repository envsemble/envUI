import { Rating } from '@envsemble/envui';

/**
 * A rating of four and a half stars, with its number. It holds still as its tile plays: a rating
 * only shows a score, and nothing on a stage could change it plausibly, so the card shows it as it
 * reads in a product's header rather than a score that changes with no cause.
 */
export default function RatingTile() {
  return <Rating value={4.5} showValue />;
}
