import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { Star } from '../icons/Star.js';

export interface RatingProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The rating, from 0 to max, such as 4.5. It shows rounded to the nearest half star, kept
   * within 0 and max; a value that is not a number, such as NaN, shows no stars filled.
   */
  value: number;
  /**
   * How many stars the scale has, as a whole number, such as 10. A fraction rounds to the
   * nearest whole star; a value below 1 or not a number shows 5 stars.
   */
  max?: number;
  /**
   * Shows the rating as a number before the stars, such as 4.5, in tabular digits. The number is
   * the rounded value the stars show, and it is hidden from assistive technology, since the stars'
   * name already says it.
   */
  showValue?: boolean;
  /**
   * Writes the accessible name of the stars from the shown value, rounded to a half star, and the
   * number of stars, such as for another language.
   * @default '{value} out of {max} stars'
   */
  formatLabel?: (value: number, max: number) => string;
}

const defaultLabel = (value: number, max: number) => `${value} out of ${max} stars`;

/**
 * A read-only rating, such as a review score: stars filled to the value in half steps in the
 * warning tone, with an optional number before them, named once for assistive technology as an
 * image, such as "4.5 out of 5 stars". It shows a rating; it does not ask for one.
 */
export function Rating({
  value,
  max = 5,
  showValue = false,
  formatLabel = defaultLabel,
  className,
  ...props
}: RatingProps) {
  const count = Number.isFinite(max) && max >= 1 ? Math.round(max) : 5;
  const shown = Number.isFinite(value)
    ? Math.min(count, Math.max(0, Math.round(value * 2) / 2))
    : 0;
  return (
    <span {...props} className={classNames('env-rating', className)}>
      {showValue && (
        <span className="env-rating-value" aria-hidden="true">
          {shown}
        </span>
      )}
      <span className="env-rating-stars" role="img" aria-label={formatLabel(shown, count)}>
        {Array.from({ length: count }, (_, index) => {
          const fill = Math.min(1, Math.max(0, shown - index));
          return (
            <span
              className="env-rating-star"
              key={index}
              data-fill={fill === 1 ? 'full' : fill > 0 ? 'half' : undefined}
            >
              <Star filled />
              {fill > 0 && fill < 1 && (
                <span className="env-rating-star-half">
                  <Star filled />
                </span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
