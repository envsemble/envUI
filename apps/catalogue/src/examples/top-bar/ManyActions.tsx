import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Help } from '@envsemble/envui/icons/Help';
import { Notifications } from '@envsemble/envui/icons/Notifications';
import { Print } from '@envsemble/envui/icons/Print';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Share } from '@envsemble/envui/icons/Share';

export default function ManyActions() {
  return (
    // Seven actions and the account: no room is left for the title.
    <TopBar
      title="Northwind"
      style={{ inlineSize: 'min(100%, 22rem)' }}
      actions={
        <>
          <IconButton icon={<Search />} aria-label="Search" variant="ghost" />
          <IconButton icon={<Share />} aria-label="Share" variant="ghost" />
          <IconButton icon={<Download />} aria-label="Download" variant="ghost" />
          <IconButton icon={<Print />} aria-label="Print" variant="ghost" />
          <IconButton icon={<Notifications />} aria-label="Notifications" variant="ghost" />
          <IconButton icon={<Settings />} aria-label="Settings" variant="ghost" />
          <IconButton icon={<Help />} aria-label="Help" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
