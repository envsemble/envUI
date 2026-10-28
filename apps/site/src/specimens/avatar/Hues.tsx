import { Avatar, avatarHues, Row } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

/** Every hue an avatar without a picture takes, with initials and with the default person picture. */
export default function Hues() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {avatarHues.map((hue) => (
          <Specimen key={hue} title={hue.charAt(0).toUpperCase() + hue.slice(1)}>
            <Row align="center" gap={3}>
              <Avatar name="Northwind Labs" fallback="initials" hue={hue} size="lg" />
              <Avatar name="Sam Lee" hue={hue} size="lg" />
              <Avatar name="Northwind Labs" fallback="initials" hue={hue} size="sm" />
              <Avatar name="Sam Lee" hue={hue} size="sm" />
            </Row>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
