import type { NavigationMessages } from '../../foundations/messages/navigation.js';
import type { NavigationDrawerDestination } from '../destinations.js';

/** A destination's name as text: its textValue, else its label, which is then a string. */
export const destinationText = (destination: NavigationDrawerDestination) =>
  destination.textValue ?? (typeof destination.label === 'string' ? destination.label : '');

/** A destination's key: its id, else its address, else its name, which the list keeps unique. */
export const destinationKey = (destination: NavigationDrawerDestination) =>
  destination.id ?? destination.href ?? destinationText(destination);

/** Whether a destination nested under these, at any depth, is the current one. */
export function holdsCurrent(
  children: readonly NavigationDrawerDestination[] | undefined,
): boolean {
  return children?.some((child) => child.current === true || holdsCurrent(child.children)) ?? false;
}

export function destinationCurrent(
  destination: NavigationDrawerDestination,
  topLevel: boolean,
): 'page' | 'true' | undefined {
  if (destination.current === true) return 'page';
  return topLevel && holdsCurrent(destination.children) ? 'true' : undefined;
}

/** The count as it shows: nothing for none or a dot, and 999+ above 999. */
export function shownCount(count: number | true | undefined): string | undefined {
  if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) return undefined;
  return count > 999 ? '999+' : String(Math.floor(count));
}

/**
 * The name of an item with a count, such as Inbox, 3 new, or with a dot, such as Activity, new;
 * undefined where its label names it.
 */
export function countedName(
  label: string,
  count: number | true | undefined,
  messages: NavigationMessages,
): string | undefined {
  if (count === true) return messages.itemNew({ label });
  const shown = shownCount(count);
  return shown === undefined ? undefined : messages.itemCount({ label, count: shown });
}
