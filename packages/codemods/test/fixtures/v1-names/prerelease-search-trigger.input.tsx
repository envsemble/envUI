import { SearchTrigger, type SearchTriggerProps } from '@envsemble/envui';

// 1.0.0-prerelease.1's SearchTrigger is a pattern now: it is reported and stays.
export function Search(props: SearchTriggerProps) {
  return <SearchTrigger {...props} fullWidth />;
}
