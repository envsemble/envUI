import { Progress } from '@envsemble/envui';

export default function SetupSteps() {
  return (
    <Progress
      label="Setting up the workspace"
      value={2}
      max={4}
      segments={4}
      valueText="Step 2 of 4"
      aria-valuetext="Step 2 of 4"
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
