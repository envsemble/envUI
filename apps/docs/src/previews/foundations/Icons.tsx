import { Text, BrandLogo, EnvUILogo, Stack } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Add } from '@envsemble/envui/icons/Add';
import { Close } from '@envsemble/envui/icons/Close';
import { Check } from '@envsemble/envui/icons/Check';
import { Groups3 } from '@envsemble/envui/icons/Groups3';
import { Example, SpecimenGrid } from '../Example';

const iconList = [
  ['Home', Home],
  ['Category', Category],
  ['Search', Search],
  ['Settings', Settings],
  ['Add', Add],
  ['Close', Close],
  ['Confirm', Check],
  ['People', Groups3],
] as const;

export function IconsPreview() {
  return (
    <>
      <Example title="Rounded symbols" size="collection">
        <SpecimenGrid size="compact">
          {iconList.map(([label, Icon]) => (
            <Stack key={label} gap={3}>
              <div className="docs-icon-pair">
                <Icon width="1.5rem" height="1.5rem" />
                <Icon filled width="1.5rem" height="1.5rem" />
              </div>
              <Text variant="caption" className="docs-caption">
                {label}
                <br />
                Outline / filled
              </Text>
            </Stack>
          ))}
        </SpecimenGrid>
      </Example>
      <Example title="Brand identity">
        <SpecimenGrid size="compact">
          <Stack gap={3}>
            <EnvUILogo className="docs-brand-specimen" />
            <Text variant="caption" className="docs-caption">
              envUI
            </Text>
          </Stack>
          <Stack gap={3}>
            <BrandLogo className="docs-brand-specimen" />
            <Text variant="caption" className="docs-caption">
              envsemble
            </Text>
          </Stack>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption">
          Bundled lockups inherit the theme’s text color.
        </Text>
      </Example>
    </>
  );
}
