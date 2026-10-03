import { version } from '@envsemble/envui/package.json';
import { Text, EnvUILogo, NavigationItem, Stack } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Add } from '@envsemble/envui/icons/Add';
import { Category } from '@envsemble/envui/icons/Category';
import { references, foundations, componentGroups } from '../Reference';
import type { ReferencePage } from '../Documentation';
import { foundationIcons, getComponentIcon } from './TopicIcons';

export function Sidebar({ routePath, page }: { routePath: string; page?: ReferencePage }) {
  const reference = page?.reference;
  return (
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
              selected={page?.section === 'Foundations' && reference?.id === item.id}
              icon={<Icon />}
            >
              {item.title}
            </NavigationItem>
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
                  <NavigationItem
                    key={item.id}
                    size="compact"
                    href={`#/components/${item.id}${item.presentation ? '' : '/preview'}`}
                    selected={reference?.id === item.id}
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
  );
}
