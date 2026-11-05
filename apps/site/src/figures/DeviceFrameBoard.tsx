import type { ComponentType, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Column, Row, Text, Theme } from '@envsemble/envui';
import NavigationForms from '../examples/scaffold/NavigationForms';
import ListAndDetail from '../examples/panes/ListAndDetail';
import AppDestinations from '../examples/navigation-drawer/AppDestinations';
import Sticky from '../examples/page/Sticky';
import AppFrame from '../examples/app-frame/AppFrame';
import { findPage } from '../navigation/SiteRoutes';
import { TilePreview } from '../template/Related';
import { galleryPreviewOf } from './Gallery';
import { DeviceFrame, DeviceStage, type DeviceKind, type DeviceLook } from './DeviceFrame';
import { DisplaySettingsProvider } from '../theme/DisplaySettings';
import { PaletteCustomizationProvider } from '../theme/PaletteCustomization';
import '../styles/index.css';
import '../styles/DeviceFrame.css';
import '../styles/DeviceFrameBoard.css';

/*
 * A demo board of device frames, not part of the site: /device-frames.html on the development
 * server, `?theme=dark` for the dark theme, `?view=compare` for the options side by side in both.
 * Each option frames the real figures that struggle in a gallery's small card today, at a card's
 * size and at a page figure's, next to how the site shows them now.
 */

const looks: { look: DeviceLook; name: string; note: string }[] = [
  { look: 'outline', name: 'A · Outline', note: 'A hairline around the screen, bars on the page.' },
  { look: 'bezel', name: 'B · Bezel', note: 'A band of a deeper fill, the bar inside it.' },
  { look: 'cutaway', name: 'C · Cutaway', note: 'The outline, larger, cut off at the stage foot.' },
];

interface Subject {
  name: string;
  /** The page whose gallery card shows it today. */
  page: string;
  example: ComponentType;
  /** Whether the site's figure shades its stage, as it does a whole window's. */
  shaded?: boolean;
  /** Whether its gallery card is a pattern's scene, larger and 4:3. */
  scene?: boolean;
  /** The frames of a page figure, in order. */
  figure: DeviceKind[];
  /** The frames its gallery card takes, a card each. */
  cards: DeviceKind[];
}

const subjects: Subject[] = [
  {
    name: 'Scaffold',
    page: 'components/scaffold',
    example: NavigationForms,
    shaded: true,
    figure: ['phone', 'window'],
    cards: ['phone', 'window'],
  },
  {
    name: 'Panes',
    page: 'components/panes',
    example: ListAndDetail,
    figure: ['phone', 'window'],
    cards: ['window'],
  },
  {
    name: 'Navigation drawer',
    page: 'components/navigation-drawer',
    example: AppDestinations,
    shaded: true,
    figure: ['window'],
    cards: ['window'],
  },
  {
    name: 'Page',
    page: 'components/page',
    example: Sticky,
    figure: ['phone', 'window'],
    cards: ['phone'],
  },
  {
    name: 'App frame',
    page: 'patterns/app-frame',
    example: AppFrame,
    shaded: true,
    scene: true,
    figure: ['phone', 'window'],
    cards: ['window', 'phone'],
  },
];

const kindName: Record<DeviceKind, string> = { phone: 'phone', window: 'window' };

/** The figure in frames on a stage of the given class. */
function Framed({
  subject,
  kinds,
  look,
  className,
}: {
  subject: Subject;
  kinds: DeviceKind[];
  look: DeviceLook;
  className: string;
}) {
  const Example = subject.example;
  return (
    <DeviceStage look={look} className={className}>
      {kinds.map((kind) => (
        <DeviceFrame key={kind} kind={kind} fill label={`${subject.name} on a ${kind}`}>
          <Example />
        </DeviceFrame>
      ))}
    </DeviceStage>
  );
}

/** A gallery card as the site draws it today: the page's own tile, at rest. */
function TodayCard({ subject }: { subject: Subject }) {
  const page = findPage(subject.page);
  return (
    // Not in a catalogue-gallery container: at a cell's width it would lay out as a phone's.
    <div>
      <ul
        className="catalogue-gallery-grid site-board-today"
        data-scenes={subject.scene ? '' : undefined}
      >
        <li className="catalogue-gallery-tile">
          <TilePreview
            preview={page && galleryPreviewOf(page)}
            near
            className="catalogue-related-stage catalogue-gallery-stage"
            whole
            ownSize={!subject.scene}
            legible={subject.scene}
          />
        </li>
      </ul>
    </div>
  );
}

/** A page figure as the site draws it today: the example on its stage. */
function TodayFigure({ subject }: { subject: Subject }) {
  const Example = subject.example;
  return (
    <div
      className="site-live-example site-board-today-figure"
      data-stage={subject.shaded ? 'shaded' : undefined}
    >
      <div style={{ justifySelf: 'stretch' }}>
        <Example />
      </div>
    </div>
  );
}

function Cell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Column gap={2} className="site-board-cell">
      {children}
      <Text variant="body-sm" emphasis="muted">
        {title}
      </Text>
    </Column>
  );
}

function Cards() {
  return (
    <Column render={<section />} gap={5}>
      <Text render={<h2 />} variant="headline">
        Gallery cards
      </Text>
      <div className="site-board-cards">
        <span />
        <Text variant="title">Today</Text>
        {looks.map(({ look, name }) => (
          <Text key={look} variant="title">
            {name}
          </Text>
        ))}
        {subjects.flatMap((subject) =>
          subject.cards.map((kind, index) => (
            <div className="site-board-card-row" key={`${subject.name} ${kind}`}>
              <Column gap={1}>
                <Text variant="title">{subject.name}</Text>
                <Text variant="body-sm" emphasis="muted">
                  {kindName[kind]}
                </Text>
              </Column>
              {index === 0 ? (
                <Cell title={`${subject.name}, today`}>
                  <TodayCard subject={subject} />
                </Cell>
              ) : (
                <span />
              )}
              {looks.map(({ look, name }) => (
                <Cell key={look} title={name}>
                  <Framed
                    subject={subject}
                    kinds={[kind]}
                    look={look}
                    className={`catalogue-related-stage catalogue-gallery-stage site-board-card${subject.scene ? ' site-board-scene' : ''}`}
                  />
                </Cell>
              ))}
            </div>
          )),
        )}
      </div>
    </Column>
  );
}

function Figures() {
  return (
    <Column render={<section />} gap={5}>
      <Text render={<h2 />} variant="headline">
        Page figures
      </Text>
      {subjects.map((subject) => (
        <Column key={subject.name} gap={3}>
          <Text render={<h3 />} variant="title">
            {subject.name}
          </Text>
          <div className="site-board-figures">
            <Cell title="Today">
              <TodayFigure subject={subject} />
            </Cell>
            {looks.map(({ look, name, note }) => (
              <Cell key={look} title={`${name}: ${note}`}>
                <Framed
                  subject={subject}
                  kinds={subject.figure}
                  look={look}
                  className="catalogue-related-stage site-board-figure"
                />
              </Cell>
            ))}
          </div>
        </Column>
      ))}
    </Column>
  );
}

/** Each option in light and dark: the Scaffold's figure in both frames and the App frame's card. */
function Compare() {
  const scaffold = subjects[0]!;
  const appFrame = subjects[4]!;
  return (
    <div className="site-board-compare">
      {(['light', 'dark'] as const).map((theme) => (
        <Theme key={theme} theme={theme} className="site-board-compare-column">
          <Text variant="title">{theme === 'light' ? 'Light' : 'Dark'}</Text>
          {looks.map(({ look, name }) => (
            <Column key={look} gap={2}>
              <Text variant="body-sm" emphasis="muted">
                {name}
              </Text>
              <Row gap={4} align="end" className="site-board-compare-row">
                <Framed
                  subject={scaffold}
                  kinds={scaffold.figure}
                  look={look}
                  className="catalogue-related-stage site-board-figure"
                />
                <Framed
                  subject={appFrame}
                  kinds={['window']}
                  look={look}
                  className="catalogue-related-stage catalogue-gallery-stage site-board-card site-board-scene"
                />
              </Row>
            </Column>
          ))}
        </Theme>
      ))}
    </div>
  );
}

function Board() {
  const search = new URLSearchParams(location.search);
  const theme = search.get('theme') === 'dark' ? 'dark' : 'light';
  const compare = search.get('view') === 'compare';
  return (
    <Theme theme={theme} className="site-board">
      <Column gap={2}>
        <Text render={<h1 />} variant="display">
          Device frames
        </Text>
        <Text emphasis="muted">
          A demo board, not on the site: the figures that struggle in a small card, each in a phone
          384 px across or a window 1024 px across at its real size, the frame scaled to fit.
        </Text>
      </Column>
      {compare ? (
        <Compare />
      ) : (
        <>
          <Cards />
          <Figures />
        </>
      )}
    </Theme>
  );
}

createRoot(document.getElementById('root')!).render(
  <PaletteCustomizationProvider>
    <DisplaySettingsProvider>
      <Board />
    </DisplaySettingsProvider>
  </PaletteCustomizationProvider>,
);
