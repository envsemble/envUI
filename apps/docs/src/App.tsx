import { useEffect, useRef, useState, type ReactNode } from 'react';
import { version } from '@envsemble/envui/package.json';
import {
  Text,
  Theme,
  EnvUILogo,
  NavigationItem,
  DirectionLink,
  Card,
  Surface,
  Stack,
  ActionGroup,
  IconButton,
  Button,
  DisclosureNote,
} from '@envsemble/envui';
import {
  Home,
  Apps,
  Palette,
  TextFields,
  ViewList,
  Devices,
  TouchApp,
  Add,
  Info,
  Category,
  DarkMode,
  LightMode,
  ArrowBack,
  ArrowForward,
} from '@envsemble/envui/icons';
import {
  references,
  foundations,
  componentGroups,
  setupCode,
  registryCode,
  installCode,
  type Reference,
} from './Reference';
import {
  documentationPages,
  findReferencePage,
  normalizeRoute,
  referenceViews,
  type ReferenceView,
} from './Documentation';
import { ReferenceContent } from './ReferencePage';
import { Code } from './Code';
function GettingStarted() {
  return (
    <div className="docs-article">
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Using this reference
        </Text>
        <Text variant="body" tone="muted">
          Preview compares both themes. Guidelines explain design and behavior. Usage covers React
          imports, props and state ownership. The downloaded reference works offline.
        </Text>
        <Text variant="body" tone="muted">
          <a href="#/getting-started?section=local-development">Local live development</a> ·{' '}
          <a href="#/getting-started?section=upgrading">Version updates</a>
        </Text>
      </Stack>
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Install the private package
        </Text>
        <Text variant="body" tone="muted">
          Use React 19 and a current browser. Configure access to envsemble’s GitHub Packages
          registry with a classic token that has <code>read:packages</code> and permission to read
          the package. Set <code>NODE_AUTH_TOKEN</code> in your shell or CI secret store.
        </Text>
        <Code language="ini">{registryCode}</Code>
        <Text variant="body" tone="muted">
          Commit registry routing and the environment placeholder in a project <code>.npmrc</code>.
          Keep the actual token in user configuration or environment variables.
        </Text>
        <Code language="sh">{installCode}</Code>
      </Stack>
      <Stack as="section">
        <Text as="h2" variant="page-heading">
          Render a component
        </Text>
        <Text variant="body" tone="muted">
          Import the stylesheet once and place content inside an explicit theme boundary. Inter,
          semantic tokens, branding and component styles are included.
        </Text>
        <Code>{setupCode}</Code>
        <Text variant="body" tone="muted">
          Use <code>theme="light"</code> or <code>theme="dark"</code>. Your application owns the
          theme preference, persistence and routing. Import symbols explicitly from{' '}
          <code>@envsemble/envui/icons</code>; components also accept custom React icons.
        </Text>
      </Stack>
      <Stack as="section" id="local-development">
        <Text as="h2" variant="page-heading">
          Local live development
        </Text>
        <Text variant="body" tone="muted">
          In the design-system repository, install dependencies and start the documentation
          workspace:
        </Text>
        <Code language="sh">{'npm install\nnpm run dev'}</Code>
        <Text variant="body" tone="muted">
          The running documentation consumes the library’s public exports through the local
          workspace. Library edits update the running preview without publishing or changing the
          version. Run <code>npm run build</code> to create the package and matching offline HTML.
        </Text>
        <Text variant="body" tone="muted">
          A future product can use a local workspace connection to the same package. Product
          integration is a separate task; products should import the implementation and stylesheet.
        </Text>
      </Stack>
      <Stack as="section" id="upgrading">
        <Text as="h2" variant="page-heading">
          Adopt an update
        </Text>
        <Text variant="body" tone="muted">
          Choose a published version intentionally, review its changelog and migration notes, and
          validate the application before releasing it.
        </Text>
        <Code language="sh">{'npm install @envsemble/envui@<version>'}</Code>
        <Text variant="body" tone="muted">
          Published versions are immutable. Compatible fixes and additions remain within the
          existing contract; breaking changes need a documented migration. The release includes an
          offline reference matching the package version.
        </Text>
      </Stack>
      <DisclosureNote title="For coding agents">
        <Text variant="body" tone="muted">
          The package includes <code>USAGE.md</code>, generated from the same maintained reference
          as these Usage pages. Read it alongside the TypeScript declarations and release notes.
        </Text>
      </DisclosureNote>
    </div>
  );
}

const foundationIcons: Record<string, typeof Palette> = {
  colors: Palette,
  typography: TextFields,
  spacing: ViewList,
  icons: Category,
  responsive: Devices,
  motion: TouchApp,
};
const groupIcons = {
  Foundations: Category,
  'Layout & surfaces': ViewList,
  Actions: TouchApp,
  'Forms & selection': TextFields,
  Navigation: Home,
  'Content & guidance': Category,
  'Feedback & overlays': Info,
} satisfies Record<Reference['group'], typeof Apps>;
function componentIcon(group: Reference['group']) {
  return groupIcons[group];
}

function Catalogue({ nested = false }: { nested?: boolean }) {
  const GroupHeading = nested ? 'h3' : 'h2';
  const Heading = nested ? 'h4' : 'h3';
  return (
    <Stack gap={7}>
      {componentGroups.map((group) => (
        <Stack as="section" gap={5} key={group}>
          <Text as={GroupHeading} variant="section-heading">
            {group}
          </Text>
          <div className="docs-catalogue-grid">
            {references
              .filter((ref) => ref.group === group)
              .map((ref) => {
                const Icon = componentIcon(ref.group);
                return (
                  <Card
                    key={ref.id}
                    href={`#/components/${ref.id}/preview`}
                    aria-labelledby={`catalogue-${ref.id}-title`}
                    aria-describedby={`catalogue-${ref.id}-description`}
                  >
                    <Stack align="center" className="docs-catalogue-content">
                      <Icon width="1.5rem" height="1.5rem" aria-hidden="true" />
                      <Stack gap={2} align="center">
                        <Text as={Heading} variant="page-heading" id={`catalogue-${ref.id}-title`}>
                          {ref.title}
                        </Text>
                        <Text
                          variant="caption"
                          id={`catalogue-${ref.id}-description`}
                          className="docs-caption"
                        >
                          {ref.summary}
                        </Text>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
          </div>
        </Stack>
      ))}
    </Stack>
  );
}

function Overview() {
  return (
    <Stack gap={8} className="docs-overview">
      <Surface tone="pane" render={<Stack gap={0} />} className="docs-overview-hero">
        <Stack gap={6} align="center">
          <EnvUILogo className="docs-overview-logo" />
          <Text as="h1" variant="page-heading">
            React components for envsemble
          </Text>
          <Text tone="muted">
            Shared components, themes and assets for consistent product interfaces.
          </Text>
          <ActionGroup align="center">
            <Button href="#/getting-started" variant="outlined" startIcon={<Add />}>
              Get started
            </Button>
            <Button href="#/foundations/colors" variant="outlined" startIcon={<Palette />}>
              Design foundations
            </Button>
          </ActionGroup>
        </Stack>
      </Surface>
      <Stack as="section" gap={5} aria-labelledby="overview-components">
        <Text as="h2" variant="page-heading" id="overview-components">
          Components
        </Text>
        <Catalogue nested />
      </Stack>
    </Stack>
  );
}

function readRoute() {
  return normalizeRoute(location.hash.replace(/^#\/?/, '') || 'overview');
}

function PageNavigation({
  path,
  appearance,
  comparison,
  view,
}: {
  path: string;
  appearance: 'light' | 'dark';
  comparison: boolean;
  view: ReferenceView;
}) {
  const index = documentationPages.findIndex((page) => page.path === path);
  if (index === -1) return null;
  const previous = documentationPages[index - 1];
  const next = documentationPages[index + 1];
  const nextAppearance = comparison ? (appearance === 'light' ? 'dark' : 'light') : appearance;
  const destination = (path: string) => (findReferencePage(path) ? `${path}/${view}` : path);
  return (
    <nav className="docs-page-navigation" aria-label="Previous and next content">
      <Theme theme={appearance} className="docs-page-navigation-side docs-page-navigation-previous">
        {previous && (
          <DirectionLink
            href={`#/${destination(previous.path)}`}
            direction="previous"
            icon={<ArrowBack />}
          >
            {previous.title}
          </DirectionLink>
        )}
      </Theme>
      <Theme theme={nextAppearance} className="docs-page-navigation-side">
        {next && (
          <DirectionLink
            href={`#/${destination(next.path)}`}
            direction="next"
            icon={<ArrowForward />}
          >
            {next.title}
          </DirectionLink>
        )}
      </Theme>
    </nav>
  );
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const routePath = route.split('?')[0];
  const parts = routePath.split('/');
  const page = findReferencePage(routePath);
  const ref = page?.reference;
  const tab = referenceViews.find((view) => view.id === parts[2])?.id ?? 'preview';
  const isOverview = routePath === 'overview';
  const comparison = Boolean(page && tab === 'preview');
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const title =
    ref?.title ??
    (routePath === 'getting-started'
      ? 'Getting started'
      : routePath === 'components'
        ? 'Components'
        : routePath === 'overview'
          ? 'envUI'
          : 'Page not found');
  const summary =
    ref?.summary ??
    (routePath === 'components'
      ? 'The full catalogue, built for consistent composition in React.'
      : routePath === 'getting-started'
        ? 'Browse the reference, install the package and make your first component.'
        : 'Choose a destination from the navigation to continue.');
  const contentRoute = page?.path ?? route;
  useEffect(() => {
    document.title = title === 'envUI' ? 'envUI' : `${title} · envUI`;
    main.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(contentRoute.split('?')[1]).get('section');
    if (section) document.getElementById(section)?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [contentRoute, title]);
  let content: ReactNode;
  if (page) content = <ReferenceContent key={page.path} page={page} view={tab} />;
  else if (routePath === 'getting-started') content = <GettingStarted />;
  else if (routePath === 'components')
    content = (
      <div className="docs-catalogue-page">
        <Catalogue />
      </div>
    );
  else if (isOverview) content = <Overview />;
  else
    content = (
      <div className="docs-article">
        <NavigationItem href="#/overview">Return to overview</NavigationItem>
      </div>
    );
  return (
    <Theme theme={appearance} className="docs-app">
      <a
        className="docs-skip"
        href="#docs-main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <a href="#/overview" className="docs-brand-link" aria-label="envUI overview">
            <EnvUILogo />
          </a>
          <Stack
            as="nav"
            gap={0}
            align="start"
            className="docs-sidebar-navigation"
            aria-label="Documentation"
          >
            <NavigationItem
              size="compact"
              href="#/overview"
              selected={routePath === 'overview'}
              icon={<Home />}
            >
              Overview
            </NavigationItem>
            <NavigationItem
              size="compact"
              href="#/getting-started"
              selected={routePath === 'getting-started'}
              icon={<Add />}
            >
              Getting started
            </NavigationItem>
            <Text variant="caption" className="docs-nav-heading">
              Foundations
            </Text>
            {foundations.map((item) => {
              const Icon = foundationIcons[item.id] ?? Category;
              return (
                <NavigationItem
                  size="compact"
                  key={item.id}
                  href={`#/foundations/${item.id}`}
                  selected={page?.section === 'Foundations' && ref?.id === item.id}
                  icon={<Icon />}
                >
                  {item.title}
                </NavigationItem>
              );
            })}
            <Text variant="caption" className="docs-nav-heading">
              <a href="#/components">Components</a>
            </Text>
            {componentGroups.map((group) => (
              <Stack key={group} gap={0} align="start" className="docs-sidebar-navigation">
                <Text variant="caption" className="docs-nav-subheading">
                  {group}
                </Text>
                {references
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = componentIcon(item.group);
                    return (
                      <NavigationItem
                        key={item.id}
                        size="compact"
                        href={`#/components/${item.id}/preview`}
                        selected={ref?.id === item.id}
                        icon={<Icon />}
                      >
                        {item.title}
                      </NavigationItem>
                    );
                  })}
              </Stack>
            ))}
          </Stack>
          <Text variant="caption" className="docs-sidebar-footer">
            envUI · {version}
            <br />
            Internal offline reference
          </Text>
        </aside>
        <main
          id="docs-main"
          ref={main}
          tabIndex={-1}
          className={`docs-main${comparison ? ' docs-comparison' : ''}`}
        >
          <header className={isOverview ? 'docs-overview-controls' : 'docs-page-header'}>
            {!isOverview && (
              <Stack gap={3} className="docs-page-header-copy">
                <Text variant="caption">
                  {page
                    ? page.section === 'Foundations'
                      ? 'Foundations'
                      : `Components / ${ref?.group}`
                    : 'envUI'}
                </Text>
                <Text as="h1" variant="page-heading">
                  {title}
                </Text>
                <Text tone="muted">{summary}</Text>
              </Stack>
            )}
            <Theme
              theme={comparison ? oppositeAppearance : appearance}
              className="docs-theme-toggle"
            >
              <IconButton
                icon={appearance === 'light' ? <DarkMode /> : <LightMode />}
                aria-label={`Switch to ${oppositeAppearance} theme`}
                title={`Switch to ${oppositeAppearance} theme`}
                onClick={() => setAppearance(oppositeAppearance)}
              />
            </Theme>
          </header>
          {content}
          <PageNavigation
            path={page?.path ?? routePath}
            appearance={appearance}
            comparison={comparison}
            view={tab}
          />
        </main>
      </div>
    </Theme>
  );
}
