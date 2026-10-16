/**
 * The English defaults of the `rating` messages: Rating. Numbers come formatted in the locale.
 * EnvUIProvider's `messages.rating` overrides any of them.
 */
export const rating = {
  /** Names the rating, such as 4.5 out of 5 stars. */
  label: ({ value, max }: { value: string; max: string }) => `${value} out of ${max} stars`,
};

export type RatingMessages = typeof rating;
