import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, onTestFinished, test } from 'vitest';
import { Alert, Button, EmptyState, Theme } from '@envsemble/envui';

function render(content: ReactNode) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  flushSync(() => root.render(<Theme theme="light">{content}</Theme>));
  return host;
}

const rect = (element: Element) => element.getBoundingClientRect();

test('an alert’s actions at the end share the message’s line, before the dismiss button, and move below it in a narrow alert', () => {
  const banner = (width: string) => (
    <div style={{ inlineSize: width }} data-width={width}>
      <Alert actionsPlacement="end" actions={<Button>Resume</Button>} onDismiss={() => {}}>
        Sync paused.
      </Alert>
    </div>
  );
  const host = render(
    <>
      {banner('40rem')}
      {banner('14rem')}
    </>,
  );
  const parts = (width: string) => {
    const alert = host.querySelector(`[data-width="${width}"] .env-alert`)!;
    return {
      message: rect(alert.querySelector('.env-alert-message')!),
      action: rect(alert.querySelector('.env-alert-action')!),
      dismiss: rect(alert.querySelector('.env-alert-dismiss')!),
    };
  };
  const wide = parts('40rem');
  expect(wide.action.left).toBeGreaterThanOrEqual(wide.message.right);
  expect(wide.action.right).toBeLessThanOrEqual(wide.dismiss.left);
  expect(wide.action.top).toBeLessThan(wide.message.bottom);
  const narrow = parts('14rem');
  expect(narrow.action.top).toBeGreaterThanOrEqual(narrow.message.bottom);
  expect(narrow.action.right).toBeLessThanOrEqual(narrow.dismiss.left);
});

test('an empty state’s illustration keeps its own size where an icon takes the icon size', () => {
  const host = render(
    <div style={{ inlineSize: '40rem' }}>
      <EmptyState
        title="No projects yet"
        illustration={<svg data-drawing="" width="160" height="120" />}
      />
    </div>,
  );
  const drawing = rect(host.querySelector('[data-drawing]')!);
  expect(drawing.width).toBe(160);
  expect(drawing.height).toBe(120);
});
