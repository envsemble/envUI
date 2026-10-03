import { Text, Card, Stack } from '@envsemble/envui';
import { references, componentGroups } from '../Reference';
import { getComponentIcon } from '../navigation/TopicIcons';

export function Catalogue() {
  return (
    <Stack gap={7}>
      {componentGroups.map((group) => (
        <Stack as="section" gap={5} key={group}>
          <Text as="h3" variant="section-heading">
            {group}
          </Text>
          <div className="docs-catalogue-grid">
            {references
              .filter((ref) => ref.group === group)
              .map((ref) => {
                const Icon = getComponentIcon(ref.group);
                return (
                  <Card
                    key={ref.id}
                    href={`#/components/${ref.id}${ref.presentation ? '' : '/preview'}`}
                    aria-labelledby={`catalogue-${ref.id}-title`}
                    aria-describedby={ref.summary ? `catalogue-${ref.id}-description` : undefined}
                  >
                    <Stack align="center" className="docs-catalogue-content">
                      <Icon width="1.5rem" height="1.5rem" aria-hidden="true" />
                      <Stack gap={2} align="center">
                        <Text as="h4" variant="page-heading" id={`catalogue-${ref.id}-title`}>
                          {ref.title}
                        </Text>
                        {ref.summary && (
                          <Text
                            variant="caption"
                            id={`catalogue-${ref.id}-description`}
                            className="docs-caption"
                          >
                            {ref.summary}
                          </Text>
                        )}
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
