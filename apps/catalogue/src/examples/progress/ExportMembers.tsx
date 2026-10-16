import { useEffect, useState } from 'react';
import { ActionGroup, Button, Progress, Stack, Text } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';

type Export = { phase: 'idle' | 'preparing' | 'exporting' | 'done'; percent: number };

export default function ExportMembers() {
  const [state, setState] = useState<Export>({ phase: 'idle', percent: 0 });
  // The export runs on a server; timers stand in for its steps here.
  useEffect(() => {
    if (state.phase === 'preparing') {
      const timer = window.setTimeout(() => setState({ phase: 'exporting', percent: 0 }), 1200);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'exporting') {
      const timer = window.setTimeout(
        () =>
          setState(({ percent }) =>
            percent >= 100
              ? { phase: 'done', percent }
              : { phase: 'exporting', percent: percent + 20 },
          ),
        400,
      );
      return () => window.clearTimeout(timer);
    }
  }, [state]);
  const running = state.phase === 'preparing' || state.phase === 'exporting';
  return (
    <Stack gap={4} align="start">
      <ActionGroup>
        <Button
          variant="secondary"
          startIcon={<Download />}
          pending={running}
          onClick={() => setState({ phase: 'preparing', percent: 0 })}
        >
          Export members
        </Button>
      </ActionGroup>
      {running && (
        // A set width, so the bar keeps its size from preparing to a known amount.
        <div style={{ inlineSize: 'min(100%, 24rem)' }}>
          <Progress
            label={state.phase === 'preparing' ? 'Preparing export' : 'Exporting members'}
            value={state.phase === 'preparing' ? null : state.percent}
            valueText={state.phase === 'preparing' ? undefined : `${state.percent}%`}
          />
        </div>
      )}
      <Text role="status" variant="supporting">
        {state.phase === 'done' ? 'Export ready: members.csv is in Downloads.' : ''}
      </Text>
    </Stack>
  );
}
