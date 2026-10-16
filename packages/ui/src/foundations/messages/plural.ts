const englishPlurals = new Intl.PluralRules('en');

/** The English word for a count: `one` for 1, `other` otherwise. */
export function plural(count: number, one: string, other: string) {
  return englishPlurals.select(count) === 'one' ? one : other;
}
