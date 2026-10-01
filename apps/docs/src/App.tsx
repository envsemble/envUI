import { useEffect, useRef, useState, type ReactNode } from 'react';
import { version } from '@envsemble/ui/package.json';
import {
  Theme,
  BrandLogo,
  NavigationItem,
  Card,
  Button,
  IconButton,
  DisclosureNote,
  FeatureCard,
} from '@envsemble/ui';
import {
  Home,
  Apps,
  Palette,
  TextFields,
  ViewList,
  Devices,
  TouchApp,
  Settings,
  Add,
  Info,
  Category,
  DarkMode,
  LightMode,
} from '@envsemble/ui/icons';
import { references, setupCode, registryCode, installCode } from './Reference';
import { foundations, FoundationPreview } from './Foundations';
import { ComponentPreview, OverviewPreview } from './Previews';

function Code({ children, language = 'tsx' }: { children: string; language?: string }) {
  return (
    <pre className="docs-code" aria-label={`${language} example`}>
      <code>{children}</code>
    </pre>
  );
}
function GettingStarted() {
  return (
    <div className="docs-article">
      <section>
        <h2>Explore the system</h2>
        <p>
          Compare actual components in light and dark appearances. Preview pages show variants and
          interactive examples; Guidelines describe the design rules; Usage covers imports, props
          and state ownership.
        </p>
        <p>
          <a href="#/getting-started?section=local-development">Local live development</a> ·{' '}
          <a href="#/getting-started?section=upgrading">Version updates</a>
        </p>
        <p>
          This downloaded reference works offline. Hash links support direct destinations and
          browser history inside the same file.
        </p>
      </section>
      <section>
        <h2>Install the private package</h2>
        <p>
          Use React 19 and a current browser. Configure access to envsemble’s GitHub Packages
          registry with a classic token that has <code>read:packages</code> and permission to read
          the package. Set <code>NODE_AUTH_TOKEN</code> in your shell or CI secret store.
        </p>
        <Code language="ini">{registryCode}</Code>
        <p>
          Commit registry routing and the environment placeholder in a project <code>.npmrc</code>.
          Keep the actual token in user configuration or environment variables.
        </p>
        <Code language="sh">{installCode}</Code>
      </section>
      <section>
        <h2>Render a component</h2>
        <p>
          Import the stylesheet once and place content inside an explicit theme boundary. Inter,
          semantic tokens, branding and component styles are included.
        </p>
        <Code>{setupCode}</Code>
        <p>
          Use <code>theme="light"</code> or <code>theme="dark"</code>. Your application owns the
          theme preference, persistence and routing. Import symbols explicitly from{' '}
          <code>@envsemble/ui/icons</code>; components also accept custom React icons.
        </p>
      </section>
      <section id="local-development">
        <h2>Local live development</h2>
        <p>
          In the design-system repository, install dependencies and start the documentation
          workspace:
        </p>
        <Code language="sh">{'npm install\nnpm run dev'}</Code>
        <p>
          The running documentation consumes the library’s public exports through the local
          workspace. Library edits update the running preview without publishing or changing the
          version. Run <code>npm run build</code> to create the package and matching offline HTML.
        </p>
        <p>
          A future product can use a local workspace connection to the same package. Product
          integration is a separate task; products should import the implementation and stylesheet.
        </p>
      </section>
      <section id="upgrading">
        <h2>Adopt an update</h2>
        <p>
          Choose a published version intentionally, review its changelog and migration notes, and
          validate the application before releasing it.
        </p>
        <Code language="sh">{'npm install @envsemble/ui@<version>'}</Code>
        <p>
          Published versions are immutable. Compatible fixes and additions remain within the
          existing contract; breaking changes need a documented migration. The release includes an
          offline reference matching the package version.
        </p>
      </section>
      <DisclosureNote title="For coding agents">
        <p>
          The package includes <code>USAGE.md</code>, generated from the same maintained reference
          as these Usage pages. Read it alongside the TypeScript declarations and release notes.
        </p>
      </DisclosureNote>
    </div>
  );
}

const foundationIcons = [Palette, TextFields, ViewList, Category, Devices, TouchApp];
function componentIcon(group: string) {
  return group === 'Actions'
    ? TouchApp
    : group === 'Forms & selection'
      ? TextFields
      : group === 'Rows & cards' || group === 'Layout'
        ? ViewList
        : group === 'Feedback'
          ? Info
          : group === 'Navigation'
            ? Home
            : Apps;
}

function Catalogue() {
  return (
    <div className="docs-catalogue-grid">
      {references.map((ref) => (
        <FeatureCard
          key={ref.id}
          icon={(() => {
            const Icon = componentIcon(ref.group);
            return <Icon />;
          })()}
          title={ref.title}
          description={ref.summary}
          action={
            <NavigationItem href={`#/components/${ref.id}/preview`}>
              Explore {ref.title.toLowerCase()}
            </NavigationItem>
          }
        />
      ))}
    </div>
  );
}

function readRoute() {
  return location.hash.replace(/^#\/?/, '') || 'overview';
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
  const ref =
    parts[0] === 'components' ? references.find((item) => item.id === parts[1]) : undefined;
  const foundation =
    parts[0] === 'foundations' ? foundations.find((item) => item.id === parts[1]) : undefined;
  const tab = ['preview', 'guidelines', 'usage'].includes(parts[2]) ? parts[2] : 'preview';
  const comparison =
    Boolean(foundation) || Boolean(ref && tab === 'preview') || routePath === 'overview';
  const oppositeAppearance = appearance === 'light' ? 'dark' : 'light';
  const title =
    ref?.title ??
    foundation?.title ??
    (routePath === 'getting-started'
      ? 'Getting started'
      : routePath === 'components'
        ? 'Components'
        : routePath === 'overview'
          ? 'Design system'
          : 'Page not found');
  const summary =
    ref?.summary ??
    foundation?.summary ??
    (routePath === 'overview'
      ? 'A shared language for envsemble products. Explore the components, foundations and interaction rules in both themes.'
      : routePath === 'components'
        ? 'The existing catalogue, built for consistent composition in React.'
        : routePath === 'getting-started'
          ? 'Browse the reference, install the package and make your first component.'
          : 'Choose a destination from the navigation to continue.');
  useEffect(() => {
    document.title = `${title} · envsemble`;
    main.current?.focus({ preventScroll: true });
    const section = new URLSearchParams(route.split('?')[1]).get('section');
    if (section) document.getElementById(section)?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [route, title]);
  let content: ReactNode;
  if (ref)
    content = (
      <>
        <nav className="docs-tabs" aria-label={`${ref.title} reference views`}>
          {['preview', 'guidelines', 'usage'].map((view) => (
            <NavigationItem
              key={view}
              href={`#/components/${ref.id}/${view}`}
              selected={tab === view}
            >
              {view[0].toUpperCase() + view.slice(1)}
            </NavigationItem>
          ))}
        </nav>
        {tab === 'preview' ? (
          <ComponentPreview key={ref.id} id={ref.id} />
        ) : tab === 'guidelines' ? (
          <div className="docs-article">
            <section>
              <h2>Design & behavior</h2>
              {ref.guidelines.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </section>
            <section>
              <h2>Shared foundations</h2>
              <p>
                <a href="#/foundations/colors">Interaction colors</a>,{' '}
                <a href="#/foundations/typography">typography</a> and{' '}
                <a href="#/foundations/motion">accessible interaction</a> apply across the
                catalogue.
              </p>
            </section>
          </div>
        ) : (
          <div className="docs-article">
            <section>
              <h2>React composition</h2>
              <Code>{ref.example}</Code>
            </section>
            <section>
              <h2>Relevant props</h2>
              <table className="docs-props">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Contract</th>
                  </tr>
                </thead>
                <tbody>
                  {ref.props.map(([name, value]) => (
                    <tr key={name}>
                      <th>{name}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="docs-caption">
                TypeScript declarations provide the complete public contract.
              </p>
            </section>
            <p>
              <a href="#/getting-started">Setup, local edits and version updates</a>
            </p>
          </div>
        )}
      </>
    );
  else if (foundation) content = <FoundationPreview key={foundation.id} id={foundation.id} />;
  else if (routePath === 'getting-started') content = <GettingStarted />;
  else if (routePath === 'components') content = <Catalogue />;
  else if (routePath === 'overview')
    content = (
      <>
        <div className="docs-overview-links">
          <NavigationItem href="#/getting-started" icon={<Add />}>
            Get started
          </NavigationItem>
          <NavigationItem href="#/components" icon={<Apps />}>
            Explore components
          </NavigationItem>
          <NavigationItem href="#/foundations/colors" icon={<Palette />}>
            Browse foundations
          </NavigationItem>
        </div>
        <OverviewPreview />
        <section className="docs-overview-footer">
          <h2>One implementation, shared across products</h2>
          <p>
            Components, semantic colors, Inter and bundled assets ship together. Designers and
            product teams can explore the visual rules; developers can use the public React API
            directly.
          </p>
        </section>
      </>
    );
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
          <a
            href="#/overview"
            className="docs-brand-link"
            aria-label="envsemble design system overview"
          >
            <BrandLogo />
          </a>
          <nav aria-label="Documentation">
            <NavigationItem
              href="#/overview"
              selected={routePath === 'overview'}
              icon={<Home />}
              selectedIcon={<Home filled />}
            >
              Overview
            </NavigationItem>
            <NavigationItem
              href="#/getting-started"
              selected={routePath === 'getting-started'}
              icon={<Add />}
            >
              Getting started
            </NavigationItem>
            <p className="docs-nav-heading">Foundations</p>
            {foundations.map((item, i) => {
              const Icon = foundationIcons[i];
              return (
                <NavigationItem
                  key={item.id}
                  href={`#/foundations/${item.id}`}
                  selected={foundation?.id === item.id}
                  icon={<Icon />}
                >
                  {item.title}
                </NavigationItem>
              );
            })}
            <p className="docs-nav-heading">
              <a href="#/components">Components</a>
            </p>
            {references.map((item, i) => {
              const Icon = componentIcon(item.group);
              const showGroup = i === 0 || references[i - 1].group !== item.group;
              return (
                <div key={item.id}>
                  {showGroup && <p className="docs-nav-subheading">{item.group}</p>}
                  <NavigationItem
                    href={`#/components/${item.id}/preview`}
                    selected={ref?.id === item.id}
                    icon={<Icon />}
                  >
                    {item.title}
                  </NavigationItem>
                </div>
              );
            })}
          </nav>
          <p className="docs-sidebar-footer">
            envsemble ui · {version}
            <br />
            Internal offline reference
          </p>
        </aside>
        <main
          id="docs-main"
          ref={main}
          tabIndex={-1}
          className={`docs-main${comparison ? ' docs-comparison' : ''}`}
        >
          <header className="docs-page-header">
            <div className="docs-page-header-copy">
              <p className="docs-eyebrow">
                {ref ? `Components / ${ref.group}` : foundation ? 'Foundations' : 'envsemble ui'}
              </p>
              <h1>{title}</h1>
              <p>{summary}</p>
            </div>
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
        </main>
      </div>
    </Theme>
  );
}
