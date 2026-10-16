import { useEffect, useState } from 'react';
import {
  ActionGroup,
  Button,
  IconButton,
  Skeleton,
  LoadingState,
  Spinner,
  Stack,
} from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

/** Simulates work that ends after a short while. */
function useSimulatedWork(duration: number) {
  const [working, setWorking] = useState(false);
  useEffect(() => {
    if (!working) return;
    const timer = setTimeout(() => setWorking(false), duration);
    return () => clearTimeout(timer);
  }, [working, duration]);
  return [working, () => setWorking(true)] as const;
}

export function SpinnerPreview() {
  const [saving, save] = useSimulatedWork(1800);
  const [refreshing, refresh] = useSimulatedWork(1800);
  return (
    <Preview>
      <Example
        title="Work in place"
        size="collection"
        caption="A spinner shows work of unknown length in a small area. A pending button keeps its size and ignores repeated presses."
      >
        <SpecimenGrid>
          <Specimen title="Spinner sizes">
            <div className="docs-spinner-row">
              <Spinner size="small" label="Loading" />
              <Spinner label="Loading" />
              <Spinner size="large" label="Loading" />
            </div>
          </Specimen>
          <Specimen title="Pending actions">
            <ActionGroup>
              <Button pending={saving} onClick={save}>
                Save changes
              </Button>
              <IconButton
                icon={<Refresh />}
                aria-label="Refresh"
                pending={refreshing}
                onClick={refresh}
              />
            </ActionGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function SkeletonPreview() {
  return (
    <Preview>
      <Example
        title="Loading placeholders"
        size="collection"
        caption="Match the expected content size to reduce layout shifts. One loading announcement per region."
      >
        <SpecimenGrid size="card">
          <Specimen title="Text placeholders">
            <LoadingState label="Loading project">
              <Stack gap={2}>
                <Skeleton width="38%" height="1.25rem" />
                <Skeleton width="100%" height="0.8rem" />
                <Skeleton width="72%" height="0.8rem" />
              </Stack>
            </LoadingState>
          </Specimen>
          <Specimen title="Rows">
            <LoadingState label="Loading settings">
              <Stack>
                {[1, 2, 3].map((rowNumber) => (
                  <Skeleton key={rowNumber} width="100%" height="3.5rem" />
                ))}
              </Stack>
            </LoadingState>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
