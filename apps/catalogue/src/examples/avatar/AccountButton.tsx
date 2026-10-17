import { AvatarButton, Menu } from '@envsemble/envui';

export default function AccountButton() {
  return (
    // The account button sits at the end of a topbar, so the menu lines up with its end.
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Menu.Root
        aria-label="Account"
        trigger={
          <AvatarButton
            name="Alex Morgan"
            description="alex.morgan@example.com"
            aria-label="Open account menu"
          />
        }
      >
        <Menu.Item href="/account">Account settings</Menu.Item>
        <Menu.Item>Sign out</Menu.Item>
      </Menu.Root>
    </div>
  );
}
