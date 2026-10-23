import { Text, Tooltip } from '@envsemble/envui';

export default function TextAbbreviation() {
  return (
    <Text>
      Standup at 9:30{' '}
      <Tooltip content="Central European Time">
        {/* Text that isn't a control: focusable, so keyboard focus opens the tooltip too. */}
        <abbr tabIndex={0}>CET</abbr>
      </Tooltip>
    </Text>
  );
}
