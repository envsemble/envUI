import { Rating } from '@envsemble/envui';

/**
 * A rating of four and a half stars, with its number. It holds still while its tile plays: a rating
 * only shows a score, and nothing on a stage could plausibly change it, so the card shows it as it
 * reads in a product's header, rather than a score that changes for no reason.
 */
export default function RatingTile() {
  return <Rating value={4.5} showValue />;
}
