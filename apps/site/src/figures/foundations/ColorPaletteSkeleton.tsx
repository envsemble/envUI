import { Button, Column, Text } from '@envsemble/envui';
import { Example } from '../Example';
import { colorGroups, colorVariable } from '../../theme/Palette';
import { PartSkeleton, placeholderText } from '../../loading/Loading';

/**
 * The editable palette while it loads with its color picker (ColorPalette.tsx): each group under
 * its heading, which the page's contents list from the start, over a skeleton of its rows, each
 * role's name and token beside a swatch of its size.
 */
export function ColorPaletteSkeleton() {
  return (
    <Column gap={0} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <Example key={group} title={group} size="collection" explains>
          <PartSkeleton what="palette">
            <Column gap={0}>
              {tokens.map(([token, label]) => (
                <div className="docs-palette-row" key={label}>
                  <div className="docs-palette-label">
                    <Text render={<span />} variant="body-sm">
                      {label}
                    </Text>
                    <code>{colorVariable(token)}</code>
                  </div>
                  <Button variant="secondary" className="docs-swatch" tabIndex={-1}>
                    <code>{placeholderText(7)}</code>
                  </Button>
                </div>
              ))}
            </Column>
          </PartSkeleton>
        </Example>
      ))}
    </Column>
  );
}
