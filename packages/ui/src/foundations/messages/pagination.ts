/**
 * The English defaults of the `pagination` messages: Pagination. Numbers come formatted in the
 * locale. EnvUIProvider's `messages.pagination` overrides any of them.
 */
export const pagination = {
  /** Names the navigation. */
  label: 'Pagination',
  /** The previous-page button's name. */
  previous: 'Previous page',
  /** The next-page button's name. */
  next: 'Next page',
  /** The shown range, such as 1–60 of 245. */
  range: ({ start, end, total }: { start: string; end: string; total?: string }) =>
    total === undefined
      ? `${start}–${end}`
      : start === end
        ? `${start} of ${total}`
        : `${start}–${end} of ${total}`,
};

export type PaginationMessages = typeof pagination;
