import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Search } from '@envsemble/envui/icons/Search';

export default function TopBarAnatomy() {
  return (
    <TopBar
      style={{ inlineSize: 'min(100%, 30rem)' }}
      start={<IconButton icon={<ArrowBack />} aria-label="Back to projects" variant="ghost" />}
      title="Website refresh"
      actions={
        <>
          <IconButton icon={<Search />} aria-label="Search" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
