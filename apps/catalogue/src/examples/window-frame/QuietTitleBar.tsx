import { Button, Menu, Menubar, Page, PageHeader, Scaffold, TopBar } from '@envsemble/envui';

export default function QuietTitleBar() {
  return (
    // The menubar and the title, with empty space to drag the window by; the page's action in its
    // header.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '12rem' }}
      topBarSpan="full"
      topBar={
        <TopBar
          titleBar
          title="Roadmap.md"
          start={
            <Menubar.Root aria-label="Application menu">
              <Menubar.Menu label="File">
                <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
          }
        />
      }
    >
      <Page
        header={<PageHeader title="Roadmap" headingLevel={3} actions={<Button>Share</Button>} />}
      />
    </Scaffold>
  );
}
