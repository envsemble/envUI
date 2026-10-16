import { plural } from './plural.js';

/**
 * The English defaults of the `avatarGroup` messages: AvatarGroup. EnvUIProvider's
 * `messages.avatarGroup` overrides any of them.
 */
export const avatarGroup = {
  /** The overflow count, such as 3 more. */
  more: ({ count }: { count: string }) => `${count} more`,
  /** Names the group, such as 4 people: Alex Morgan, Sam Lee. */
  label: ({ count, names }: { count: number; names: string }) =>
    `${count} ${plural(count, 'person', 'people')}: ${names}`,
};

export type AvatarGroupMessages = typeof avatarGroup;
