import { Menu, Menubar, Page, PageHeader, Scaffold, Text, TopBar } from '@envsemble/envui';

export default function WindowFrameAnatomy() {
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '14rem' }}
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
      <Page header={<PageHeader title="Roadmap" headingLevel={3} />}>
        <Text emphasis="muted">The body scrolls below the title bar.</Text>
      </Page>
    </Scaffold>
  );
}
