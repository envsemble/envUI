import { Progress } from '@envsemble/envui';

export default function VagueLabel() {
  return (
    // Wrong: the label doesn't say what is running, and 25% hides what people count.
    <Progress
      label="Please wait…"
      value={25}
      valueText="25%"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
