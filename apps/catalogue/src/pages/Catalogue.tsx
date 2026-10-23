import { Text, Card, Column } from '@envsemble/envui';
import { componentGroups, componentGroupId } from '../Reference';
import { getComponentIcon } from '../navigation/TopicIcons';
import { pageHref, referencePages } from '../navigation/DocumentationRoutes';

/** The components on the Site, each with its page; Field is in the Docs only. */
const sitePages = referencePages.filter(
  (page) => page.section === 'Components' && !page.path.startsWith('docs/'),
);

/** Every component of the Site, a card for each, by group. */
export function Catalogue() {
  return (
    <Column gap={7}>
      {componentGroups.map((group) => (
        <Column render={<section />} gap={5} key={group}>
          <Text render={<h2 />} variant="title" id={componentGroupId(group)}>
            {group}
          </Text>
          <div className="docs-catalogue-grid">
            {sitePages
              .filter((page) => page.reference.group === group)
              .map((page) => {
                const ref = page.reference;
                const Icon = getComponentIcon(ref.group);
                return (
                  <Card key={ref.id} href={pageHref(page)}>
                    <Column gap={4} align="center" className="docs-catalogue-content">
                      <Icon width="1.5rem" height="1.5rem" aria-hidden="true" />
                      <Column gap={2} align="center">
                        <Text render={<h3 />} variant="headline">
                          {ref.title}
                        </Text>
                        {ref.summary && (
                          <Text variant="caption" className="docs-caption">
                            {ref.summary}
                          </Text>
                        )}
                      </Column>
                    </Column>
                  </Card>
                );
              })}
          </div>
        </Column>
      ))}
    </Column>
  );
}
