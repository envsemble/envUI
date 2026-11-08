import { Avatar, avatarHues, Row } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

/** Every hue an avatar without a picture takes, with initials and with the default person picture. */
export default function Hues() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {avatarHues.map((hue) => (
          <SpecimenPart key={hue} title={hue.charAt(0).toUpperCase() + hue.slice(1)}>
            <Row align="center" gap={3}>
              <Avatar name="Northwind Labs" hue={hue} size="lg" />
              <Avatar name="Sam Lee" fallback="person" hue={hue} size="lg" />
              <Avatar name="Northwind Labs" hue={hue} size="sm" />
              <Avatar name="Sam Lee" fallback="person" hue={hue} size="sm" />
            </Row>
          </SpecimenPart>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
