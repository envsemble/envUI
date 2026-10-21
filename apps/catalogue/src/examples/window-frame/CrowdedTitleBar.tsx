import { Button, IconButton, Page, PageHeader, Scaffold, TopBar } from '@envsemble/envui';
import { History } from '@envsemble/envui/icons/History';
import { Print } from '@envsemble/envui/icons/Print';
import { Search } from '@envsemble/envui/icons/Search';

export default function CrowdedTitleBar() {
  return (
    // The page's actions crowd the title bar, which leaves no room to drag the window.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '12rem' }}
      topBarSpan="full"
      topBar={
        <TopBar
          titleBar
          title="Roadmap.md"
          actions={
            <>
              <IconButton icon={<Search />} aria-label="Search" />
              <IconButton icon={<History />} aria-label="History" />
              <IconButton icon={<Print />} aria-label="Print" />
              <Button size="sm">Share</Button>
            </>
          }
        />
      }
    >
      <Page header={<PageHeader title="Roadmap" headingLevel={3} />} />
    </Scaffold>
  );
}
