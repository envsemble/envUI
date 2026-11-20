/** A run of destinations of one group, in the list's order: NavigationDrawer's sections. */
export interface DestinationSection<Item> {
  /** The group's heading, or undefined for destinations outside any group. */
  group: string | undefined;
  items: Item[];
}

/**
 * The list's destinations in runs of one group, in their order: a new section starts wherever
 * `group` differs from the destination before.
 */
export function destinationSections<Item extends { group?: string }>(
  destinations: readonly Item[],
): DestinationSection<Item>[] {
  const sections: DestinationSection<Item>[] = [];
  for (const destination of destinations) {
    const last = sections.at(-1);
    if (last && last.group === destination.group) last.items.push(destination);
    else sections.push({ group: destination.group, items: [destination] });
  }
  return sections;
}
