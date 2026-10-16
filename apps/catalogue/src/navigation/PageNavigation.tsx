import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { documentationPages, type ReferenceView } from './DocumentationRoutes';

export function PageNavigation({ path, view }: { path: string; view: ReferenceView }) {
  const index = documentationPages.findIndex((page) => page.path === path);
  if (index === -1) return null;
  const previous = documentationPages[index - 1];
  const next = documentationPages[index + 1];
  const destination = (path: string) =>
    path === 'overview'
      ? `overview/${view === 'usage' ? 'get-started' : 'components'}`
      : `${path}/${view}`;
  return (
    <Pager.Root
      className="docs-page-navigation"
      previous={
        previous && {
          href: `#/${destination(previous.path)}`,
          children: previous.title,
          icon: <ArrowBack />,
        }
      }
      next={
        next && {
          href: `#/${destination(next.path)}`,
          children: next.title,
          icon: <ArrowForward />,
        }
      }
    />
  );
}
