import { plural } from './plural.js';

/**
 * The English defaults of the `avatarGroup` messages: AvatarGroup. EnvUIProvider's
 * `messages.avatarGroup` overrides any of them.
 */
export const avatarGroup = {
  /** People beyond the list, such as 3 more; `number` is the count in the locale's digits. */
  more: ({ number }: { count: number; number: string }) => `${number} more`,
  /**
   * Names the group, such as 4 people: Alex Morgan, Sam Lee; `number` is the count in the locale's
   * digits, and `names` the names joined by commas.
   */
  label: ({ count, number, names }: { count: number; number: string; names: string }) =>
    `${number} ${plural(count, 'person', 'people')}: ${names}`,
};

export type AvatarGroupMessages = typeof avatarGroup;
