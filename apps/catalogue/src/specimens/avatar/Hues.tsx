import { Avatar, avatarHues, Stack } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Every hue an avatar without a picture takes, with initials and with the default person picture. */
export default function Hues() {
  return (
    <Example title="Colors" size="collection">
      <SpecimenGrid size="compact">
        {avatarHues.map((hue) => (
          <Specimen
            key={hue}
            title={hue}
            caption={`--env-color-avatar-bg${hue === 'blue' ? '' : `-${hue}`}`}
          >
            <Stack direction="row" align="center" gap={3}>
              <Avatar name="Northwind Labs" fallback="initials" hue={hue} size="lg" />
              <Avatar name="Sam Lee" hue={hue} size="lg" />
              <Avatar name="Northwind Labs" fallback="initials" hue={hue} size="sm" />
              <Avatar name="Sam Lee" hue={hue} size="sm" />
            </Stack>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
