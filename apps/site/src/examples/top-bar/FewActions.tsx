import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { Notifications } from '@envsemble/envui/icons/Notifications';
import { Search } from '@envsemble/envui/icons/Search';

export default function FewActions() {
  return (
    <TopBar
      title="Northwind"
      style={{ inlineSize: 'min(100%, 22rem)' }}
      actions={
        <>
          <IconButton icon={<Search />} aria-label="Search" variant="ghost" />
          <IconButton icon={<Notifications />} aria-label="Notifications" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
