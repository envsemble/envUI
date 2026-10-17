import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AppShell,
  Button,
  NavList,
  Page,
  PageHeader,
  Sidebar,
  SidebarTrigger,
  Surface,
  Text,
  TextField,
  useAppShell,
  useContainerSize,
} from '@envsemble/envui';
import { Assignment } from '@envsemble/envui/icons/Assignment';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import './Frame.css';

const sections = ['Questions', 'Responses', 'Settings', 'Sharing'];

/** The element's distance from the top of its scroll element's content, from its layout offsets. */
function contentTop(element: HTMLElement, scroller: HTMLElement) {
  let top = 0;
  for (let node: HTMLElement | null = element; node && node !== scroller; ) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

/** The page's content: the summary panel, the sections, the reveal and read controls. */
function Responses({ slot }: { slot: HTMLElement | null }) {
  const { getStickyTop, getScrollElement } = useAppShell();
  const main = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState('');
  // Below 40 rem of the page's own width the summary moves into the sidebar's slot.
  const size = useContainerSize(main);
  const narrow = size !== undefined && size.inlineSize < 640;
  const summary = (
    <Surface data-testid="summary" data-place={narrow && slot ? 'sidebar' : 'page'}>
      <Text>12 responses this week</Text>
    </Surface>
  );
  const reveal = (id: string) => {
    const section = document.getElementById(id);
    const scroller = getScrollElement();
    if (!section || !scroller) return;
    // Below the frame's header and the page's sticky header, both of which the frame publishes.
    const pageHeader = parseFloat(
      getComputedStyle(section).getPropertyValue('--env-page-header-block-size') || '0',
    );
    scroller.scrollTo({ top: contentTop(section, scroller) - getStickyTop() - pageHeader });
  };
  return (
    <div ref={main}>
      {narrow && slot ? createPortal(summary, slot) : summary}
      <div className="fixture-actions">
        <Button variant="secondary" onClick={() => setStickyTop(String(getStickyTop()))}>
          Read the sticky top
        </Button>
        <Button variant="secondary" onClick={() => reveal('section-sharing')}>
          Reveal Sharing
        </Button>
        <output data-testid="sticky-top">{stickyTop}</output>
      </div>
      <TextField label="Form title" defaultValue="Team survey" />
      <div className="fixture-frame-sticky" data-testid="sticky-bar">
        Sticks under the header
      </div>
      {sections.map((section) => (
        <section
          key={section}
          id={`section-${section.toLowerCase()}`}
          className="fixture-frame-section"
          aria-label={section}
        >
          <Text render={<h2 />} variant="title">
            {section}
          </Text>
        </section>
      ))}
      {/* Room below the last section, so it can scroll to the top. */}
      <div className="fixture-frame-filler" />
    </div>
  );
}

/**
 * A survey workspace whose document scrolls under a header across the window, mounted with
 * ?fixture=frame-document: a sidebar of surveys with a second, filling section as a portal target,
 * and a page with a sticky PageHeader whose summary panel moves into that slot when the page is
 * narrow. Nothing measures the header: sticky offsets come from the frame's variables and
 * useAppShell().getStickyTop(). ?titleBar makes the header the window's title bar.
 */
export function DocumentFrameFixture() {
  const titleBar = new URLSearchParams(location.search).has('titleBar');
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  return (
    <AppShell.Root
      scroll="document"
      headerSpan="full"
      titleBar={titleBar}
      persist="frame-document"
      className="fixture-frame"
    >
      <AppShell.SkipLinks />
      <AppShell.Header
        start={<SidebarTrigger />}
        end={
          <>
            <Button variant="secondary">Preview</Button>
            <Button variant="primary">Publish</Button>
          </>
        }
      >
        Team survey
      </AppShell.Header>
      <Sidebar.Root label="Surveys">
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item href="#/survey" icon={<Assignment />} selected>
              Team survey
            </NavList.Item>
            <NavList.Item href="#/inbox" icon={<Inbox />}>
              Submissions
            </NavList.Item>
          </NavList.Root>
        </Sidebar.Content>
        <Sidebar.Content fill>
          <div ref={setSlot} data-testid="sidebar-slot" />
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Main>
        <Page
          width="lg"
          header={
            <PageHeader
              sticky
              title="Responses"
              actions={<Button variant="secondary">Export</Button>}
            />
          }
        >
          <Responses slot={slot} />
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
