import { Button, Column, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../SpecimenFrame';
import { colorGroups, colorVariable } from '../../display/Palette';
import { PartSkeleton, placeholderText } from '../../loading/Skeletons';

export function ColorPaletteSkeleton() {
  return (
    <Column gap={0} className="docs-palette">
      {colorGroups.map(([group, tokens]) => (
        <SpecimenFrame key={group} title={group} size="collection">
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
        </SpecimenFrame>
      ))}
    </Column>
  );
}
