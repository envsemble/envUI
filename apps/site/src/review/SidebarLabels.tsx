import { EnvUIProvider, NavigationDrawer, Text, Theme } from '@envsemble/envui';
import { pagesOf } from '../navigation/SiteRoutes';
import { pageDestinations } from '../navigation/SiteNavigation';
import './SidebarLabels.css';

/**
 * A review page, not part of the catalogue: the drawer's group headings in the current style and
 * four typography-only alternatives, side by side in light and dark, each a real NavigationDrawer
 * of the catalogue's Components pages. Each option is a scoped override in SidebarLabels.css; the
 * library's style sheet is unchanged. `?contrast=high` shows them under high contrast.
 */
const options = [
  { id: 'today', name: 'Today', note: 'body-sm 14 px, regular, fg-muted' },
  { id: 'a', name: 'A · Overline', note: 'caption 12 px, medium, uppercase, +0.06em, fg-muted' },
  {
    id: 'b',
    name: 'B · Strong label',
    note: 'body-sm 14 px, semibold, fg-default; items fg-muted',
  },
  { id: 'c', name: 'C · Air above', note: 'caption 12 px, medium, fg-muted; space-6 above' },
  { id: 'd', name: 'D · Heading', note: 'title 16 px, medium, fg-default, -0.01em; space-5 above' },
] as const;

const components = pagesOf('catalogue').filter((page) => page.section === 'Components');
const currentPath = components.find((page) => page.path.endsWith('/button'))?.path ?? '';

export function SidebarLabels() {
  const contrast =
    new URLSearchParams(location.search).get('contrast') === 'high' ? 'high' : 'standard';
  return (
    <EnvUIProvider>
      {(['light', 'dark'] as const).map((theme) => (
        <Theme key={theme} theme={theme} contrast={contrast} className="site-labels-row">
          <Text variant="title" render={<h2 />}>
            {theme === 'light' ? 'Light' : 'Dark'}
            {contrast === 'high' ? ', high contrast' : ''}
          </Text>
          <div className="site-labels-grid">
            {options.map((option) => (
              <section
                key={option.id}
                className="site-labels-option"
                data-option={option.id}
                data-theme={theme}
              >
                <Text variant="body-sm" emphasis="default" render={<h3 />}>
                  {option.name}
                </Text>
                <Text variant="caption">{option.note}</Text>
                <NavigationDrawer
                  aria-label={`Components, ${option.name}, ${theme}`}
                  className="site-labels-drawer"
                  destinations={pageDestinations(components, currentPath)}
                />
              </section>
            ))}
          </div>
        </Theme>
      ))}
    </EnvUIProvider>
  );
}
