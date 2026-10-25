import type { CSSProperties } from 'react';
import { Column, IconButton, Kbd, Surface, Text, useTheme } from '@envsemble/envui';
import { ViewInAr } from '@envsemble/envui/icons/ViewInAr';
import { PageHeader } from '../layout/PageHeader';
import type { SitePage } from '../navigation/DocumentationRoutes';
import { ExampleStage } from '../previews/Example';
import { Preview } from '../previews/Preview';
import { Block, Figure, Topic } from '../previews/foundations/Topic';
import { Demo } from './GuideDocument';
import { GuideLink } from './SitePages';
// Pictures of the real dev mode at work on the demo application, captured by
// scripts/CaptureDevModeImage.mjs (npm run docs:dev-mode-image) in each theme.
import wholeLight from '../demos/dev-mode/dev-mode-whole-light.webp';
import wholeDark from '../demos/dev-mode/dev-mode-whole-dark.webp';
import toolbarLight from '../demos/dev-mode/dev-mode-toolbar-light.webp';
import toolbarDark from '../demos/dev-mode/dev-mode-toolbar-dark.webp';
import inspectorLight from '../demos/dev-mode/dev-mode-inspector-light.webp';
import inspectorDark from '../demos/dev-mode/dev-mode-inspector-dark.webp';
import spacingLight from '../demos/dev-mode/dev-mode-spacing-light.webp';
import spacingDark from '../demos/dev-mode/dev-mode-spacing-dark.webp';
import problemsLight from '../demos/dev-mode/dev-mode-problems-light.webp';
import problemsDark from '../demos/dev-mode/dev-mode-problems-dark.webp';
import frameLight from '../demos/dev-mode/dev-mode-frame-light.webp';
import frameDark from '../demos/dev-mode/dev-mode-frame-dark.webp';

/** A picture of dev mode in each theme, with its size in CSS pixels: the files hold twice as many. */
interface Shot {
  light: string;
  dark: string;
  width: number;
  height: number;
  alt: string;
}

const shots = {
  whole: {
    light: wholeLight,
    dark: wholeDark,
    width: 1280,
    height: 800,
    alt: 'Dev mode open over a small application: the list of its boxes on the left, its layers tilted in the middle with one card selected, and the details of that card on the right.',
  },
  toolbar: {
    light: toolbarLight,
    dark: toolbarDark,
    width: 304,
    height: 189,
    alt: "Dev mode's toolbar of four dropdowns, the first open: the view's angles laid out as they look at the page, Top above Front, Left and Right beside it, Tilted in the top right corner, and Fit below them.",
  },
  inspector: {
    light: inspectorLight,
    dark: inspectorDark,
    width: 352,
    height: 329,
    alt: 'The details of a selected card: what it is, its size and window class, and its one problem in red, a sentence saying its text is squeezed and how to give it room.',
  },
  spacing: {
    light: spacingLight,
    dark: spacingDark,
    width: 318,
    height: 299,
    alt: 'One card alone, close up and tilted: the padding around its content and the gaps between its parts are hatched.',
  },
  problems: {
    light: problemsLight,
    dark: problemsDark,
    width: 256,
    height: 698,
    alt: 'The list of the boxes of a page, headed by six problems: each card and its header is marked with one.',
  },
  frame: {
    light: frameLight,
    dark: frameDark,
    width: 394,
    height: 680,
    alt: "The application laid out at a phone's size, inside a frame with handles on its edges: its three columns of cards are outlined in red, their words broken over many short lines.",
  },
} satisfies Record<string, Shot>;

/** One picture of dev mode at work, in the reader's theme, on the recessed canvas. */
function ShotFigure({ shot, label }: { shot: Shot; label: string }) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? shot.dark : shot.light;
  return (
    <Figure label={label}>
      <img
        className="docs-dev-mode-shot"
        src={src}
        // The file holds twice the CSS size: the picture shows at its own size, or narrower.
        style={{ '--docs-shot-width': `${shot.width / 16}rem` } as CSSProperties}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
      />
    </Figure>
  );
}

/**
 * The dev mode button as an application shows it while it is being built: round, in the bottom
 * corner of the page. A picture, so it takes no focus.
 */
function ButtonFigure() {
  return (
    <Figure label="The dev mode button in the corner of a page">
      <Surface
        background="default"
        padding={5}
        radius="xl"
        className="docs-dev-mode-corner"
        render={<Column gap={2} />}
        inert
      >
        <Text render={<p />} variant="title">
          Projects
        </Text>
        <Text render={<p />} emphasis="muted">
          Three projects, two of them updated today.
        </Text>
        <IconButton
          variant="secondary"
          icon={<ViewInAr />}
          aria-label="Dev mode"
          className="docs-dev-mode-button"
        />
      </Surface>
    </Figure>
  );
}

/**
 * Dev mode's page on the Site: what it shows, what it helps you notice and how to open it, in
 * pictures of the real dev mode and plain words, with the real dev mode to try on a small
 * application. Its guide in the Docs, which Guide opens, holds the readout, the options and code.
 */
export function DevModePage({ page }: { page: SitePage }) {
  return (
    <>
      <PageHeader
        title={page.title}
        breadcrumb="Overview"
        description={page.summary}
        symbol={<ViewInAr />}
        meta={<GuideLink path="docs/dev-mode" />}
      />
      <Preview>
        <ExampleStage value={false}>
          <Topic
            title="Try it"
            lead="This is dev mode's view of a small application. Try dev mode opens the real one over it: drag to turn the view, pick a layer to learn about it, and press Esc to close it."
          >
            <Demo name="DevModeDemo" />
          </Topic>
          <Topic
            title="What it shows you"
            lead="Every box of a page is lifted onto a layer of its own, higher the deeper it sits, so you see what holds what and the room around each."
          >
            <Block
              stacked
              title="Everything at once"
              text="The list of the page's boxes on one side, the layers in the middle and the details of the one you pick on the other. Rest on a box in the list to light up its layer."
            >
              <ShotFigure shot={shots.whole} label="Dev mode open over an application" />
            </Block>
            <Block
              stacked
              title="A toolbar over the view"
              text="Four dropdowns, each named as you point at it: look at the page tilted, from the front, the top or a side, choose what the layers show, and lay the page out at a phone's or a tablet's size."
            >
              <ShotFigure shot={shots.toolbar} label="Dev mode's toolbar" />
            </Block>
            <Block
              title="The details of one box"
              text="Pick a layer, or a box in the list, to see what it is, how big it is, which window class its width falls in, and any problem it has, said in a sentence with how to fix it."
            >
              <ShotFigure shot={shots.inspector} label="The details of a selected card" />
            </Block>
          </Topic>
          <Topic
            title="What it helps you notice"
            lead="Mistakes that hide in a finished screen stand out once its boxes are pulled apart, and dev mode names the ones it can find."
          >
            <Block
              title="Uneven spacing"
              text="The padding inside each box and the gaps between boxes are hatched, so a gap wider or narrower than its neighbours shows at a glance."
            >
              <ShotFigure shot={shots.spacing} label="A card's padding and gaps" />
            </Block>
            <Block
              title="Squeezed or spilling content"
              text="A box whose text is squeezed into a narrow column, or whose content spills out of it, is outlined in red, and the list counts the problems of each box."
            >
              <ShotFigure shot={shots.problems} label="The list of boxes with their problems" />
            </Block>
            <Block
              title="A layout that breaks at a width"
              text="Lay the page out at a phone's or a tablet's size, or drag the frame's edges, and watch it change. Here three columns of cards don't fit a phone, so their words break over short lines."
            >
              <ShotFigure shot={shots.frame} label="The application at a phone's size" />
            </Block>
          </Topic>
          <Topic
            title="Turning it on"
            lead="Dev mode comes with envUI for the time an application is being built: the application people use doesn't include it."
          >
            <Block
              title="Press the dev mode button"
              text={
                <>
                  The round button in the bottom corner of the page opens dev mode in a new tab, and
                  so does <Kbd keys={['Alt', 'Shift', 'D']} />. The page you were on stays as it
                  was; close the tab when you are done.
                </>
              }
            >
              <ButtonFigure />
            </Block>
            <Block
              title="Agents see it too"
              text="A coding agent reads the same page as words, with the same problems, at any width, and fixes what it finds. Ask it to check a page with dev mode at a phone's width and a wide screen's."
            />
          </Topic>
        </ExampleStage>
      </Preview>
    </>
  );
}
