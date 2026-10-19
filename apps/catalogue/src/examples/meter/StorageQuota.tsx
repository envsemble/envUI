import { Meter } from '@envsemble/envui';

const usedGigabytes = 7.2;
const quotaGigabytes = 10;
const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

export default function StorageQuota() {
  const used = number.format(usedGigabytes);
  const quota = number.format(quotaGigabytes);
  return (
    <Meter
      label="Storage"
      value={usedGigabytes}
      max={quotaGigabytes}
      valueText={`${used} GB of ${quota} GB`}
      // Units in words, so a screen reader doesn't read the abbreviation.
      aria-valuetext={`${used} gigabytes of ${quota}`}
    />
  );
}
