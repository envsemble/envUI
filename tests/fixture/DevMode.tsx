import { useEffect, useRef } from 'react';
import { Button, Dialog } from '@envsemble/envui';
import { installDevMode } from '@envsemble/envui/dev';

// Layout nodes as the primitives and scaffolds render them, written out by hand: a scaffold that
// switches arrangement at 37.5rem, a page, a row of identical cards, and a few faults for the
// readout to find.
const styles = `
.dev-scaffold { container: env-scaffold / inline-size; }
.dev-frame { display: grid; gap: 1rem; padding: 1rem; }
@container env-scaffold (inline-size >= 37.5rem) {
  .dev-frame { grid-template-columns: 12rem minmax(0, 1fr); }
}
.dev-nav, .dev-page { display: flex; flex-direction: column; gap: 0.5rem; min-inline-size: 0; }
.dev-cards { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.dev-card { inline-size: 8rem; padding: 0.5rem; }
.dev-painted { display: flex; gap: 0.5rem; background: rgb(255 0 0 / 0.2); }
.dev-clip { overflow: hidden; block-size: 6rem; }
.dev-sticky { position: sticky; top: 0; }
.dev-clip-only { overflow: clip; block-size: 3rem; }
.env-fixture-panel { background: rgb(0 0 255 / 0.1); }
.dev-wide { display: grid; }
.dev-wide-content { inline-size: 30rem; block-size: 1rem; }
.dev-outsets { position: relative; display: flex; align-items: center; gap: 0.5rem; inline-size: 14rem; }
.dev-outset-margin { margin-inline-start: -0.5rem; }
.dev-outset-hit { position: relative; margin-inline-start: auto; }
.dev-outset-hit::before { content: ''; position: absolute; inset: -1rem; }
.dev-outset-turned { display: inline-block; inline-size: 2rem; block-size: 2rem; transform: rotate(45deg); }
.dev-outset-handle { position: absolute; inset-block-start: -0.5rem; inset-inline: 0; block-size: 1rem; }
.dev-off-window { position: fixed; inset: auto; left: -4rem; top: 2rem; margin: 0; inline-size: 10rem; }
`;

/**
 * A page for dev mode: its readout, its checks at other widths, and its toggle. `&root=<selector>`
 * gives dev mode a root of its own, as the docs' demo does.
 */
export function DevModeFixture() {
  const popover = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = new URLSearchParams(window.location.search).get('root') ?? undefined;
    const devMode = installDevMode({ parts: { schemaVersion: 1, components: {} }, root });
    return () => devMode.uninstall();
  }, []);
  return (
    <>
      <style>{styles}</style>
      <div className="dev-scaffold" data-env-layout="scaffold" data-env-name="app">
        <div className="dev-frame" data-env-layout="grid" data-env-name="frame">
          <nav className="dev-nav" data-env-layout="column" data-env-name="nav">
            <Button variant="ghost" onClick={() => popover.current?.showPopover()}>
              Open the popover
            </Button>
            {/* A dialog sits in a positioner fixed over the window, not in a floating box. */}
            <Dialog title="Details" trigger={<Button variant="ghost">Open the dialog</Button>}>
              In a dialog
            </Dialog>
          </nav>
          <main className="dev-page" data-env-layout="page">
            <div className="dev-clip" data-env-layout="column" data-env-name="clipped">
              <h2 className="dev-sticky" data-env-layout="row" data-env-name="heading">
                Heading
              </h2>
            </div>
            {/* overflow: clip makes no scroll container: the heading sticks in the document. */}
            <div className="dev-clip-only" data-env-layout="column" data-env-name="clip-only">
              <div className="dev-sticky" data-env-layout="row" data-env-name="sticks-on" />
            </div>
            {/* A component painting through a primitive it renders carries its part class. */}
            <div className="env-fixture-panel" data-env-layout="column">
              Panel
            </div>
            <div className="dev-cards" data-env-layout="row" data-env-name="cards">
              {['first', 'second', 'third'].map((name) => (
                <div key={name} className="dev-card" data-env-layout="column" data-env-name={name}>
                  Card
                </div>
              ))}
            </div>
            <div className="dev-painted" data-env-layout="row" data-env-name="painted">
              Painted
            </div>
            {/* Set out past their places on purpose, so no overflow: a negative margin, a hit area
                past its box, a turned box, and a handle across the row's edge. */}
            <div className="dev-outsets" data-env-layout="row" data-env-name="outsets">
              <span className="dev-outset-margin">Margin</span>
              <span className="dev-outset-turned" />
              <span className="dev-outset-handle" />
              <span className="dev-outset-hit">Hit</span>
            </div>
            <div className="dev-wide" data-env-layout="grid" data-env-name="wide">
              <div className="dev-wide-content" />
            </div>
            <div hidden data-env-layout="box" data-env-name="hidden">
              <div data-env-layout="row" />
            </div>
          </main>
        </div>
      </div>
      <div ref={popover} popover="manual" className="dev-off-window">
        Off the window
      </div>
    </>
  );
}
