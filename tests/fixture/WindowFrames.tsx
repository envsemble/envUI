import { useRef } from 'react';
import { Button, IconButton, Menu, Menubar, WindowFrame } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Settings } from '@envsemble/envui/icons/Settings';

function StartPageMenubar() {
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New note</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item shortcut="Ctrl+C">Copy</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

/**
 * A title bar without the shell, as on a start page, in a window frame whose content scrolls below
 * it, mounted with ?fixture=window-frame.
 */
export function WindowFrameFixture() {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <WindowFrame.Root className="fixture-title-bar-page" data-testid="window-frame">
      <WindowFrame.TitleBar
        data-testid="title-bar"
        start={
          <>
            <span data-testid="title-bar-mark">B</span>
            <StartPageMenubar />
            <IconButton icon={<ArrowBack />} aria-label="Back" />
          </>
        }
        end={
          <>
            <Button variant="secondary">Share</Button>
            <IconButton variant="secondary" icon={<Settings />} aria-label="Settings" />
          </>
        }
      >
        <span data-testid="title-bar-title">Quarterly report</span>
      </WindowFrame.TitleBar>
      <WindowFrame.Content ref={scroller} data-testid="window-frame-content">
        <div className="fixture-tall-page">
          <p>Start page content</p>
          <button type="button" onClick={() => scroller.current?.scrollTo(0, 200)}>
            Restore start page scroll
          </button>
          {Array.from({ length: 60 }, (_, index) => (
            <p key={index}>Recent document {index + 1}</p>
          ))}
        </div>
      </WindowFrame.Content>
    </WindowFrame.Root>
  );
}
