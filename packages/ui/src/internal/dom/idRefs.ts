/** The ids an attribute such as aria-describedby references, space-separated; undefined for none. */
export function idRefs(...ids: Array<string | undefined | false>) {
  return ids.filter(Boolean).join(' ') || undefined;
}
