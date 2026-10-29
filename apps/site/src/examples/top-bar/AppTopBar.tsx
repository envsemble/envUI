import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function AppTopBar() {
  return (
    <TopBar
      start={<IconButton icon={<IconArrowBack />} aria-label="Back to projects" variant="ghost" />}
      title="Website refresh"
      actions={
        <>
          <IconButton icon={<IconSearch />} aria-label="Search" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
