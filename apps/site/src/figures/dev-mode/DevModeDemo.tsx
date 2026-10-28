import { useEffect, useRef, useState } from 'react';
import { Button, Column, Row, Text, Theme, useTheme } from '@envsemble/envui';
import { ViewInAr } from '@envsemble/envui/icons/ViewInAr';
import type { DevModeHandle } from '@envsemble/envui/dev';
import { keepLinksInPlace } from '../LiveExample';
import { DemoApp } from './DemoApp';
// The 3D view of the application below, captured from the real dev mode by
// scripts/docs/CaptureDevModeImage.ts (npm run docs:dev-mode-image).
import viewLight from './dev-mode-3d-light.webp';
import viewDark from './dev-mode-3d-dark.webp';
// The parts' descriptions the inspector shows, fetched as dev mode opens.
import partsUrl from '../../../../../docs/generated/parts.json?url';

/** The captured images' size in CSS pixels; the files hold twice as many. */
const viewSize = { width: 960, height: 600 };

/**
 * The dev mode page's one example: a picture of dev mode's 3D view of a small application, in the
 * reader's theme, and Try dev mode, which puts the application in the picture's place and opens
 * the real dev mode over it at once. Nothing of dev mode loads before it is pressed.
 */
export function DevModeDemo() {
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [devMode, setDevMode] = useState<DevModeHandle | null>(null);
  const [failed, setFailed] = useState(false);
  return (
    <Column gap={5}>
      {started ? (
        <LiveApplication onReady={setDevMode} onFail={() => setFailed(true)} />
      ) : (
        <img
          className="docs-dev-mode-picture"
          src={theme === 'dark' ? viewDark : viewLight}
          alt="Dev mode's 3D view of a small application: its layout boxes pulled apart into stacked, tilted layers, the scaffold at the bottom, then the top bar, the navigation and the page, and the cards, their headers and the list on top, each outlined in the color of its kind and labelled with its name."
          width={viewSize.width}
          height={viewSize.height}
        />
      )}
      <Row>
        <Button
          variant="primary"
          startIcon={<ViewInAr />}
          // Once dev mode is in, the button opens it again after it was closed.
          pending={started && !devMode && !failed}
          onClick={() => (devMode ? devMode.open() : setStarted(true))}
        >
          Try dev mode
        </Button>
      </Row>
      {failed && (
        <Text role="alert" emphasis="muted">
          Dev mode failed to load. Reload the page to try again.
        </Text>
      )}
    </Column>
  );
}

/**
 * The application of the picture, live, with the real `@envsemble/envui/dev` loaded and scoped to
 * its root, so the 3D view, the inspector and the readout describe the application rather than
 * the page around it. Dev mode opens as soon as it is installed, and is uninstalled as the page
 * goes.
 */
function LiveApplication({
  onReady,
  onFail,
}: {
  onReady: (handle: DevModeHandle) => void;
  onFail: () => void;
}) {
  const theme = useTheme();
  const root = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  const fail = useRef(onFail);
  useEffect(() => {
    let handle: DevModeHandle | undefined;
    let gone = false;
    import('@envsemble/envui/dev')
      .then(({ installDevMode }) => {
        if (gone || !root.current) return;
        handle = installDevMode({ root: root.current, button: false, parts: partsUrl });
        ready.current(handle);
        handle.open();
      })
      .catch(() => {
        if (!gone) fail.current();
      });
    return () => {
      gone = true;
      handle?.uninstall();
    };
  }, []);
  return (
    <Column
      render={<Theme {...theme} />}
      container="env-window"
      gap={0}
      role="group"
      aria-label="Example application"
      className="site-live-example"
      // The application's page has the page's color: a shade darker stage shows its edges.
      data-stage="shaded"
      {...keepLinksInPlace}
    >
      <div ref={root} data-dev-mode-demo="">
        {/* Its three fixed columns squeeze the cards at a narrow width: the problem dev mode finds. */}
        <DemoApp fixedColumns />
      </div>
    </Column>
  );
}
