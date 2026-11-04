import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { IconNotifications } from '@envsemble/envui/icons/Notifications';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function FewActions() {
  return (
    <TopBar
      title="Northwind"
      style={{ inlineSize: 'min(100%, 22rem)' }}
      actions={
        <>
          <IconButton icon={<IconSearch />} aria-label="Search" variant="ghost" />
          <IconButton icon={<IconNotifications />} aria-label="Notifications" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
