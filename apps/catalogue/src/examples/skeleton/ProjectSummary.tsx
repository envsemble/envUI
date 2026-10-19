import { LoadingState, Skeleton } from '@envsemble/envui';

export default function ProjectSummary() {
  return (
    // A heading and two lines of description, at the sizes of the text that replaces them.
    <LoadingState label="Loading project">
      <Skeleton width="38%" height="1.25rem" />
      <Skeleton width="100%" />
      <Skeleton width="72%" />
    </LoadingState>
  );
}
