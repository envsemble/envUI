/**
 * The English defaults of the `accountMenu` messages: AccountMenu. EnvUIProvider's
 * `messages.accountMenu` overrides any of them.
 */
export const accountMenu = {
  /** Names the trigger. */
  label: 'Account',
  /** The theme submenu's label. */
  theme: 'Theme',
  /** The organization submenu's label. */
  organization: 'Organization',
};

export type AccountMenuMessages = typeof accountMenu;
