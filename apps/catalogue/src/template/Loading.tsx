import { Spinner } from '@envsemble/envui';

/**
 * What the Usage guide shows while a part of a page loads, such as an example or its code: envUI's
 * own Spinner with its label, as the Usage guide asks of applications, rather than a line of text.
 */
export function Loading({ what }: { what: string }) {
  return <Spinner className="docs-loading" label={`Loading ${what}`} showLabel />;
}
