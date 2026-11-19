import { useEffect, useRef, useState } from 'react';
import { Button, Column, Row, Text, Theme, useTheme } from '@envsemble/envui';
import { IconViewInAr } from '@envsemble/envui/icons/ViewInAr';
import type { DevModeHandle } from '@envsemble/envui/dev';
import { keepLinksInPlace } from '../KeepLinksInPlace';
import { SmallApplication } from './SmallApplication';
import { useBrowserStandIns } from '../../motion/BrowserStandIns';
import viewLight from './dev-mode-3d-light.webp';
import viewDark from './dev-mode-3d-dark.webp';
import partDescriptionsUrl from '../../../../../docs/generated/parts.json?url';

const viewSizePx = { width: 960, height: 600 };

export function TryDevMode() {
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [devMode, setDevMode] = useState<DevModeHandle | null>(null);
  const [failed, setFailed] = useState(false);
  const devModeLoading = started && !devMode && !failed;
  return (
    <Column gap={5}>
      {started ? (
        <LiveApplication onReady={setDevMode} onFail={() => setFailed(true)} />
      ) : (
        <img
          className="docs-dev-mode-picture"
          src={theme === 'dark' ? viewDark : viewLight}
          alt="Dev mode's 3D view of a small application: its layout boxes pulled apart into stacked, tilted layers, the scaffold at the bottom, then the top bar, the navigation and the page, and the cards, their headers and the list on top, each outlined in the color of its kind and labelled with its name."
          width={viewSizePx.width}
          height={viewSizePx.height}
        />
      )}
      <Row>
        <Button
          variant="primary"
          start={<IconViewInAr />}
          pending={devModeLoading}
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

function LiveApplication({
  onReady,
  onFail,
}: {
  onReady: (handle: DevModeHandle) => void;
  onFail: () => void;
}) {
  useBrowserStandIns();
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
        handle = installDevMode({ root: root.current, button: false, parts: partDescriptionsUrl });
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
      data-stage="shaded"
      {...keepLinksInPlace}
    >
      <div ref={root} data-dev-mode-demo="">
        <SmallApplication fixedColumns />
      </div>
    </Column>
  );
}
