import { Meter } from '@envsemble/envui';

export default function PercentOfStorage() {
  return (
    // Wrong: people count storage in gigabytes, and 72% doesn't say how much is left.
    <Meter label="Storage" value={72} valueText="72%" style={{ inlineSize: 'min(100%, 20rem)' }} />
  );
}
