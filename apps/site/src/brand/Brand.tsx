import { Link } from '@envsemble/envui';
import { EnvUIDocsLogo } from './EnvUIDocsLogo';
import { EnvUILogo } from './EnvUILogo';
import type { Area } from '../routes/SiteRoutes';
import { docsRoute, homeRoute, routeHref } from '../routes/Address';

export function Brand({ area }: { area: Area }) {
  return (
    <Link
      href={routeHref(area === 'docs' ? docsRoute : homeRoute)}
      underline={false}
      className="site-brand"
      aria-label={area === 'docs' ? 'envUI Docs home' : 'envUI home'}
    >
      {area === 'docs' ? <EnvUIDocsLogo className="docs-brand-docs" /> : <EnvUILogo />}
    </Link>
  );
}
