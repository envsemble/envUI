import { plural } from './plural.js';

/**
 * The English defaults of the `avatarGroup` messages: AvatarGroup. EnvUIProvider's
 * `messages.avatarGroup` overrides any of them.
 */
export const avatarGroup = {
  /** People beyond the list, such as 3 more; `countText` is the count in the locale's digits. */
  more: ({ countText }: { count: number; countText: string }) => `${countText} more`,
  /**
   * Names the group, such as 4 people: Alex Morgan, Sam Lee; `countText` is the count in the
   * locale's digits, and `names` the names joined by commas.
   */
  label: ({ count, countText, names }: { count: number; countText: string; names: string }) =>
    `${countText} ${plural(count, 'person', 'people')}: ${names}`,
};

export type AvatarGroupMessages = typeof avatarGroup;
