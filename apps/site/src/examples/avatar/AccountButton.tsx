import { AvatarButton, Menu } from '@envsemble/envui';

export default function AccountButton() {
  return (
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
  );
}
