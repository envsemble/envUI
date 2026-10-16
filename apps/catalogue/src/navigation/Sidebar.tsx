import { version } from '@envsemble/envui/package.json';
import { Text, EnvUILogo, NavList, Stack, Link } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
import { references, foundations, componentGroups } from '../Reference';
import type { ReferencePage } from './DocumentationRoutes';
import { foundationIcons, getComponentIcon } from './TopicIcons';

export function Sidebar({
  routePath,
  page,
  panel = false,
  onNavigate,
}: {
  routePath: string;
  page?: ReferencePage;
  panel?: boolean;
  onNavigate?: () => void;
}) {
  const reference = page?.reference;
  return (
    <aside
      className={panel ? 'docs-navigation-panel' : 'docs-sidebar'}
      onClick={(event) => {
        if ((event.target as Element).closest('a[href]')) onNavigate?.();
      }}
    >
      <Link
        href="#/overview"
        underline={false}
        className="docs-brand-link"
        aria-label="envUI overview"
      >
        <EnvUILogo />
      </Link>
      <Stack
        as="nav"
        gap={0}
        align="start"
        className="docs-sidebar-navigation"
        aria-label="Documentation"
      >
        <NavList.Item
          size="compact"
          href="#/overview"
          selected={routePath.split('/')[0] === 'overview'}
          icon={<Home />}
        >
          Overview
        </NavList.Item>
        <Text variant="caption" className="docs-nav-heading">
          Foundations
        </Text>
        {foundations.map((item) => {
          const Icon = foundationIcons[item.id] ?? Category;
          return (
            <NavList.Item
              size="compact"
              key={item.id}
              href={`#/foundations/${item.id}`}
              selected={page?.section === 'Foundations' && reference?.id === item.id}
              icon={<Icon />}
            >
              {item.title}
            </NavList.Item>
          );
        })}
        {componentGroups.map((group) => (
          <Stack key={group} gap={0} align="start" className="docs-sidebar-navigation">
            <Text variant="caption" className="docs-nav-subheading">
              {group}
            </Text>
            {references
              .filter((item) => item.group === group)
              .map((item) => {
                const Icon = getComponentIcon(item.group);
                return (
                  <NavList.Item
                    key={item.id}
                    size="compact"
                    href={`#/components/${item.id}/preview`}
                    selected={reference?.id === item.id}
                    icon={<Icon />}
                  >
                    {item.title}
                  </NavList.Item>
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
  );
}
