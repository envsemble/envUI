import { Text, BrandLogo, EnvUILogo, Stack } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../Example';
import { IconCatalogue } from './IconCatalogue';

export function IconsPreview({
  onRequestUsage,
}: {
  onRequestUsage?: (name: string, filled: boolean) => void;
}) {
  return (
    <>
      <IconCatalogue onRequestUsage={onRequestUsage} />
      <Example title="Brand identity">
        <SpecimenGrid size="compact">
          <Stack gap={3}>
            <EnvUILogo className="docs-brand-specimen" />
            <Text variant="caption">envUI</Text>
          </Stack>
          <Stack gap={3}>
            <BrandLogo className="docs-brand-specimen" />
            <Text variant="caption">envsemble</Text>
          </Stack>
        </SpecimenGrid>
        <Text tone="muted">
          React lockups inherit the theme's text color. Raw SVGs and favicons use fixed colors.
        </Text>
      </Example>
    </>
  );
}
