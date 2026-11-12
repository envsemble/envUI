import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconNotifications } from '@envsemble/envui/icons/Notifications';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconShare } from '@envsemble/envui/icons/Share';

export default function ManyActions() {
  return (
    // Five actions and the account: little room is left for the title.
    <TopBar
      title="Northwind"
      style={{ inlineSize: 'min(100%, 22rem)' }}
      actions={
        <>
          <IconButton icon={<IconSearch />} aria-label="Search" variant="ghost" />
          <IconButton icon={<IconShare />} aria-label="Share" variant="ghost" />
          <IconButton icon={<IconDownload />} aria-label="Download" variant="ghost" />
          <IconButton icon={<IconNotifications />} aria-label="Notifications" variant="ghost" />
          <IconButton icon={<IconSettings />} aria-label="Settings" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
