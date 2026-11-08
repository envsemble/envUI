import { useState } from 'react';
import {
  Avatar,
  AvatarButton,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Column,
  DescriptionList,
  Grid,
  IconButton,
  LineArt,
  List,
  NavigationDrawer,
  NavigationRail,
  Page,
  PageHeader,
  PanelDock,
  Panes,
  Row,
  Scaffold,
  SearchField,
  Surface,
  Text,
  TopBar,
  type Destination,
  type PanelDockPanel,
} from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { Block, Cell, Section, Strip, interactionStates } from './ContactSheetParts.fixture.js';

const drawings = [
  'golden-section',
  'square-circle-triangle',
  'whirling-squares',
  'triangle-and-circles',
  'ford-circles',
  'harmonic-division',
  'pappus-chain',
  'root-rectangles',
  'sacred-cut',
  'gothic-tracery',
  'quartered-square',
  'graded-quadtree',
  'monochord',
  'logarithmic-grid',
  'pointed-arcade',
  'root-two-halving',
] as const;

function Primitives() {
  return (
    <Section name="Box, Row, Column, Grid">
      <Strip label="Box">
        {[0, 2, 4, 6].map((padding) => (
          <Cell key={padding} caption={`padding ${padding}`}>
            <Box
              padding={padding as 0 | 2 | 4 | 6}
              style={{ outline: '1px dashed var(--env-color-border-default)' }}
            >
              <Block>Content</Block>
            </Box>
          </Cell>
        ))}
      </Strip>
      <Strip label="Row">
        {[1, 3, 6].map((gap) => (
          <Cell key={gap} caption={`gap ${gap}`}>
            <Row gap={gap as 1 | 3 | 6}>
              <Block>A</Block>
              <Block>B</Block>
              <Block>C</Block>
            </Row>
          </Cell>
        ))}
        <Cell caption="justify between, align center" width="18rem">
          <Row justify="between" align="center">
            <Block style={{ minBlockSize: '3rem' }}>Tall</Block>
            <Block>B</Block>
            <Block>C</Block>
          </Row>
        </Cell>
        <Cell caption="wrap" width="10rem">
          <Row wrap gap={2}>
            {['One', 'Two', 'Three', 'Four', 'Five'].map((label) => (
              <Block key={label}>{label}</Block>
            ))}
          </Row>
        </Cell>
      </Strip>
      <Strip label="Column">
        {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
          <Cell key={align} caption={`align ${align}`} width="9rem">
            <Column gap={2} align={align}>
              <Block>Short</Block>
              <Block>Longer one</Block>
            </Column>
          </Cell>
        ))}
      </Strip>
      <Strip label="Grid">
        <Cell caption="3 columns" width="20rem">
          <Grid columns={3} gap={2}>
            {Array.from({ length: 6 }, (_, index) => (
              <Block key={index}>{index + 1}</Block>
            ))}
          </Grid>
        </Cell>
        <Cell caption="min 6rem, fitting" width="24rem">
          <Grid columns={{ min: '6rem' }} gap={2}>
            {Array.from({ length: 7 }, (_, index) => (
              <Block key={index}>{index + 1}</Block>
            ))}
          </Grid>
        </Cell>
        <Cell caption="2fr 1fr" width="20rem">
          <Grid columns="minmax(0, 2fr) minmax(0, 1fr)" gap={3}>
            <Block>Main</Block>
            <Block>Details</Block>
          </Grid>
        </Cell>
      </Strip>
    </Section>
  );
}

function Surfaces() {
  return (
    <Section name="Surface">
      <Strip label="Backgrounds">
        {(['default', 'muted', 'page', 'raised', 'recessed'] as const).map((background) => (
          <Cell key={background} caption={background}>
            <Surface background={background} padding={4}>
              <Text variant="body-sm">{background} surface</Text>
            </Surface>
          </Cell>
        ))}
      </Strip>
      <Strip label="Radius">
        {(['xl', 'sm', 'full', 'none'] as const).map((radius) => (
          <Cell key={radius} caption={radius}>
            <Surface background="default" radius={radius} padding={3}>
              <Text variant="body-sm">radius {radius}</Text>
            </Surface>
          </Cell>
        ))}
        <Cell caption="Skeleton" width="14rem">
          <Surface background="default" padding={4} skeleton>
            <Text>Loading text</Text>
            <Text variant="body-sm">More loading text here</Text>
          </Surface>
        </Cell>
      </Strip>
    </Section>
  );
}

function Cards() {
  const content = {
    title: 'Website refresh',
    meta: <Badge tone="success">Active</Badge>,
    description: 'New pricing page and onboarding.',
  };
  // A link or button card is one control, so it holds its content as children.
  const linkContent = (
    <Column gap={1}>
      <Text variant="title" render={<span />}>
        Website refresh
      </Text>
      <Text variant="body-sm" emphasis="muted">
        New pricing page and onboarding.
      </Text>
    </Column>
  );
  return (
    <Section name="Card">
      <Strip label="Backgrounds">
        {(['default', 'muted', 'page'] as const).map((background) => (
          <Cell key={background} caption={background} width="16rem">
            <Card
              background={background}
              {...content}
              actions={
                <Button variant="outline" size="sm">
                  Open
                </Button>
              }
            />
          </Cell>
        ))}
        <Cell caption="Plain content" width="16rem">
          <Card>
            <Text>Any content in a card.</Text>
          </Card>
        </Cell>
        <Cell caption="Skeleton" width="16rem">
          <Card skeleton {...content} />
        </Cell>
      </Strip>
      <Strip label="Link card (href)">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force} target="a" width="16rem">
            <Card href="#project">{linkContent}</Card>
          </Cell>
        ))}
        <Cell caption="Disabled" width="16rem">
          <Card href="#project" disabled>
            {linkContent}
          </Card>
        </Cell>
      </Strip>
      <Strip label="Button card">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force} target="button" width="16rem">
            <Card onClick={() => {}}>{linkContent}</Card>
          </Cell>
        ))}
        <Cell caption="Disabled" width="16rem">
          <Card onClick={() => {}} disabled>
            {linkContent}
          </Card>
        </Cell>
      </Strip>
    </Section>
  );
}

function LineArts() {
  return (
    <Section name="LineArt">
      <Strip label="Drawings">
        {drawings.map((drawing) => (
          <Cell key={drawing} caption={drawing} width="13rem">
            <Surface
              background="default"
              padding={0}
              style={{ overflow: 'hidden', aspectRatio: '20 / 9' }}
            >
              <LineArt drawing={drawing} />
            </Surface>
          </Cell>
        ))}
      </Strip>
      <Strip label="Align">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Cell key={align} caption={align} width="16rem">
            <Surface
              background="muted"
              padding={0}
              style={{ overflow: 'hidden', aspectRatio: '3 / 1' }}
            >
              <LineArt drawing="pappus-chain" align={align} />
            </Surface>
          </Cell>
        ))}
      </Strip>
    </Section>
  );
}

function Pages() {
  return (
    <Section name="Page and PageHeader">
      <Strip label="PageHeader">
        <Cell caption="Every slot" width="40rem">
          <PageHeader
            headingLevel={3}
            breadcrumbs={
              <Breadcrumbs
                wrap={false}
                items={[{ label: 'People', href: '#people' }, { label: 'Sam Lee' }]}
              />
            }
            start={<Avatar name="Sam Lee" />}
            title="Sam Lee"
            meta={<Badge>Admin</Badge>}
            description="Product designer"
            actions={<Button>Edit profile</Button>}
            toolbar={<SearchField label="Search activity" size="sm" />}
          />
        </Cell>
        <Cell caption="Title and actions, controlSize sm" width="40rem">
          <PageHeader
            headingLevel={3}
            title="Projects"
            controlSize="sm"
            actions={
              <>
                <Button variant="outline">Import</Button>
                <Button>New project</Button>
              </>
            }
          />
        </Cell>
      </Strip>
      <Strip label="Page widths">
        {(['sm', 'md', 'lg', 'full'] as const).map((width) => (
          <Cell key={width} caption={`width ${width}, in a 36rem frame`} width="36rem">
            <div
              style={{ outline: '1px dashed var(--env-color-border-default)', inlineSize: '100%' }}
            >
              <Page width={width} header={<PageHeader title="Inbox" headingLevel={3} />}>
                <Block>Page content</Block>
              </Page>
            </div>
          </Cell>
        ))}
        <Cell caption="No gutter" width="36rem">
          <div
            style={{ outline: '1px dashed var(--env-color-border-default)', inlineSize: '100%' }}
          >
            <Page gutter={false} header={<PageHeader title="Inbox" headingLevel={3} />}>
              <Block>Page content</Block>
            </Page>
          </div>
        </Cell>
      </Strip>
    </Section>
  );
}

function TopBars() {
  const bar = (props: Partial<Parameters<typeof TopBar>[0]>) => (
    <TopBar
      start={<IconButton icon={<IconArrowBack />} aria-label="Back to projects" variant="ghost" />}
      title="Website refresh"
      actions={
        <>
          <IconButton icon={<IconSearch />} aria-label="Search" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
      {...props}
    />
  );
  return (
    <Section name="TopBar">
      <Strip>
        <Cell caption="Default" width="30rem">
          {bar({})}
        </Cell>
        <Cell caption="Page background" width="30rem">
          {bar({ background: 'page' })}
        </Cell>
        <Cell caption="Loading" width="30rem">
          {bar({ loading: true })}
        </Cell>
        <Cell caption="Title bar" width="30rem">
          {bar({ titleBar: true })}
        </Cell>
        <Cell caption="Skeleton" width="30rem">
          {bar({ skeleton: true })}
        </Cell>
      </Strip>
    </Section>
  );
}

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '#home' },
  { label: 'Inbox', icon: <IconInbox />, href: '#inbox', current: true, count: 3 },
  { label: 'Settings', icon: <IconSettings />, href: '#settings' },
];

function Scaffolds() {
  const content = (
    <Page header={<PageHeader title="Inbox" headingLevel={3} />}>
      <Text emphasis="muted">Three messages since yesterday.</Text>
    </Page>
  );
  return (
    <Section name="Scaffold">
      <Strip>
        <Cell caption="Rail, top bar over the body" width="36rem">
          <Scaffold
            scroll="body"
            landmarks={false}
            style={{ blockSize: '16rem' }}
            navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
            topBar={
              <TopBar
                title="Northwind"
                actions={<IconButton icon={<IconSearch />} aria-label="Search" />}
              />
            }
            navigation={{ rail: <NavigationRail destinations={destinations} /> }}
          >
            {content}
          </Scaffold>
        </Cell>
        <Cell caption="Drawer, top bar full width" width="40rem">
          <Scaffold
            scroll="body"
            landmarks={false}
            topBarSpan="full"
            style={{ blockSize: '16rem' }}
            navigationForms={{
              compact: 'drawer',
              medium: 'drawer',
              expanded: 'drawer',
              large: 'drawer',
            }}
            topBar={<TopBar title="Northwind" actions={<AvatarButton name="Alex Morgan" />} />}
            navigation={{ drawer: <NavigationDrawer destinations={destinations} /> }}
          >
            {content}
          </Scaffold>
        </Cell>
      </Strip>
    </Section>
  );
}

function PanesStrip() {
  const [open, setOpen] = useState(true);
  return (
    <Section name="Panes">
      <Strip>
        <Cell caption="List and detail" width="50rem">
          <Panes.Root
            behavior="list-detail"
            splitAt="medium"
            defaultWidth={14}
            style={{ blockSize: '12rem' }}
          >
            <Panes.List label="Inbox">
              <Surface padding={2} style={{ minBlockSize: '100%' }}>
                <List.Root aria-label="Messages">
                  <List.Item label="Launch checklist" description="Priya Shah" current />
                  <List.Item label="Budget review" description="Sam Lee" />
                </List.Root>
              </Surface>
            </Panes.List>
            <Panes.Divider label="Resize the inbox" />
            <Panes.Detail label="Launch checklist">
              <Surface padding={4} render={<Column gap={2} />} style={{ minBlockSize: '100%' }}>
                <Text variant="title" render={<h3 />}>
                  Launch checklist
                </Text>
                <Text>The venue is booked.</Text>
              </Surface>
            </Panes.Detail>
          </Panes.Root>
        </Cell>
        <Cell
          caption="Divider: hover"
          force="hover"
          target=".env-panes-divider, [role=separator]"
          width="50rem"
        >
          <Panes.Root
            behavior="list-detail"
            splitAt="medium"
            defaultWidth={14}
            style={{ blockSize: '8rem' }}
          >
            <Panes.List label="Inbox">
              <Surface padding={2} style={{ minBlockSize: '100%' }}>
                <Text>List</Text>
              </Surface>
            </Panes.List>
            <Panes.Divider label="Resize the inbox" />
            <Panes.Detail label="Detail">
              <Surface padding={2} style={{ minBlockSize: '100%' }}>
                <Text>Detail</Text>
              </Surface>
            </Panes.Detail>
          </Panes.Root>
        </Cell>
        <Cell caption="Supporting pane open" width="50rem">
          <Panes.Root
            behavior="supporting"
            splitAt="medium"
            open={open}
            onOpenChange={setOpen}
            style={{ blockSize: '14rem' }}
          >
            <Panes.Main label="Quarterly report">
              <Column gap={3} padding={4} align="start">
                <Text variant="title" render={<h3 />}>
                  Quarterly report
                </Text>
                <Panes.Trigger variant="secondary" startIcon={<IconInfo />}>
                  Details
                </Panes.Trigger>
              </Column>
            </Panes.Main>
            <Panes.Supporting label="Report details">
              <Column padding={4}>
                <DescriptionList.Root aria-label="About the report">
                  <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
                  <DescriptionList.Item label="Due">31 March</DescriptionList.Item>
                </DescriptionList.Root>
              </Column>
            </Panes.Supporting>
          </Panes.Root>
        </Cell>
        <Cell caption="Supporting pane skeleton" width="50rem">
          <Panes.Root
            behavior="supporting"
            splitAt="medium"
            defaultOpen
            style={{ blockSize: '10rem' }}
          >
            <Panes.Main label="Report">
              <Column padding={4}>
                <Text>Main</Text>
              </Column>
            </Panes.Main>
            <Panes.Supporting label="Details" skeleton>
              <Column padding={4}>
                <Text>Owner: Sam Lee</Text>
              </Column>
            </Panes.Supporting>
          </Panes.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

function Dock({
  initial,
  overflow,
}: {
  initial: PanelDockPanel[];
  overflow?: 'scroll' | 'minimize';
}) {
  const [panels, setPanels] = useState(initial);
  return (
    <Surface
      background="muted"
      padding={0}
      style={{ position: 'relative', blockSize: '17rem', inlineSize: '100%', overflow: 'hidden' }}
    >
      <PanelDock.Root
        panels={panels}
        stackBelow="30rem"
        overflow={overflow}
        onModeChange={(id, mode) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
          )
        }
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) =>
          setPanels((current) => current.map((panel) => ({ ...panel, active: panel.id === id })))
        }
        onHeightChange={(id, height) =>
          setPanels((current) =>
            current.map((panel) => (panel.id === id ? { ...panel, height } : panel)),
          )
        }
      >
        {(panel) => (
          <>
            <PanelDock.Header
              title={panel.title}
              meta="Edited by Alex Morgan"
              actions={
                <IconButton variant="ghost" size="sm" icon={<IconMoreVert />} aria-label="More" />
              }
            />
            <Text style={{ padding: '0 1.5rem 1.5rem' }}>The launch moves to May.</Text>
          </>
        )}
      </PanelDock.Root>
    </Surface>
  );
}

function PanelDocks() {
  return (
    <Section name="PanelDock">
      <Strip>
        <Cell caption="One open and active, one minimized" width="34rem">
          <Dock
            initial={[
              { id: 'press', title: 'Press release', mode: 'open', active: true, height: 12.5 },
              { id: 'budget', title: 'Budget', mode: 'minimized' },
            ]}
          />
        </Cell>
        <Cell caption="Two open side by side, one minimized" width="44rem">
          <Dock
            initial={[
              { id: 'press', title: 'Press release', mode: 'open', active: true, height: 12 },
              { id: 'notes', title: 'Notes', mode: 'open', height: 10 },
              { id: 'budget', title: 'Budget', mode: 'minimized' },
            ]}
          />
        </Cell>
        <Cell caption="Narrow: stacked" width="24rem">
          <Dock
            initial={[
              { id: 'press', title: 'Press release', mode: 'open', active: true, height: 12.5 },
            ]}
          />
        </Cell>
      </Strip>
    </Section>
  );
}

export function LayoutSheet() {
  return (
    <>
      <Primitives />
      <Surfaces />
      <Cards />
      <LineArts />
      <Pages />
      <TopBars />
      <Scaffolds />
      <PanesStrip />
      <PanelDocks />
    </>
  );
}
