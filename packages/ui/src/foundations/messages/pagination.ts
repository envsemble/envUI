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
  /**
   * The shown range from its first and last item and the total, formatted in the locale: 1–60 of
   * 245, 245 of 245 for a single item, or 61–120 without a total.
   */
  range: ({ start, end, total }: { start: string; end: string; total?: string }) => {
    const shown = start === end ? end : `${start}–${end}`;
    return total === undefined ? shown : `${shown} of ${total}`;
  },
};
