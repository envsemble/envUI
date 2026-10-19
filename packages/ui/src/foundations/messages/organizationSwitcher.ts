/**
 * The English defaults of the `organizationSwitcher` messages: OrganizationSwitcher.
 * EnvUIProvider's `messages.organizationSwitcher` overrides any of them.
 */
export const organizationSwitcher = {
  /** Names the trigger. */
  label: 'Organizations',
  /** The menu's heading. */
  heading: 'Organizations',
  /** The create item's label. */
  create: 'Create organization',
  /** Shown while no organization is chosen. */
  placeholder: 'Choose organization',
};

export type OrganizationSwitcherMessages = typeof organizationSwitcher;
