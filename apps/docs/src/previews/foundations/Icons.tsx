import { Text, BrandLogo, EnvUILogo, Stack } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import { Example, SpecimenGrid } from '../Example';
import { IconCatalogue } from './IconCatalogue';

export function IconsPreview() {
  return (
    <>
      <IconCatalogue />
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
        <CodeBlock language="tsx">{`import logoUrl from '@envsemble/envui/assets/envUI/envUI-lockup-black.svg';
import faviconUrl from '@envsemble/envui/assets/envUI/envUI-favicon.ico';`}</CodeBlock>
        <Text variant="caption">
          White versions: envUI-lockup-white.svg and envUI-favicon-white.ico in the same folder. The
          raw envsemble logo is exported at @envsemble/envui/assets/envsemble-lockup-black.svg.
        </Text>
      </Example>
    </>
  );
}
