import { Stat } from '@envsemble/envui';

export default function DefaultToneForBadNews() {
  return (
    <Stat.Root label="Error rate" value="0.4%" trend={{ direction: 'up', label: '+0.1 points' }} />
  );
}
