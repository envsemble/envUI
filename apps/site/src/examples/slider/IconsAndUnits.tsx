import { Column, Row, Slider, Text } from '@envsemble/envui';
import { IconLightMode } from '@envsemble/envui/icons/LightMode';
import { IconVolumeUp } from '@envsemble/envui/icons/VolumeUp';

const withUnit = (unit: string) => (value: number) => (
  <>
    {value}
    <Text render={<span />} variant="caption" emphasis="muted">
      {' '}
      {unit}
    </Text>
  </>
);

export default function IconsAndUnits() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Slider
        label={
          <Row render={<span />} align="center" gap={2}>
            <IconVolumeUp /> Volume
          </Row>
        }
        defaultValue={60}
        formatValue={(value) => `${value} percent`}
        renderValue={withUnit('%')}
      />
      <Slider
        label={
          <Row render={<span />} align="center" gap={2}>
            <IconLightMode /> Brightness
          </Row>
        }
        defaultValue={300}
        max={500}
        step={50}
        formatValue={(value) => `${value} nits`}
        renderValue={withUnit('nits')}
      />
    </Column>
  );
}
