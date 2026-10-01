import { Theme, DirectionLink } from '@envsemble/envui';
import { ArrowBack, ArrowForward } from '@envsemble/envui/icons';
import { documentationPages, findReferencePage, type ReferenceView } from '../Documentation';

export function PageNavigation({
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
