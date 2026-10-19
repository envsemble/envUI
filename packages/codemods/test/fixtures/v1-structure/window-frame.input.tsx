import { useRef } from 'react';
import { WindowFrame } from '@envsemble/envui';

export function StartPage({ bar, page }) {
  const scroller = useRef(null);
  return (
    <>
      <WindowFrame.Root
        className="start"
        scrollRef={scroller}
        titleBar={<WindowFrame.TitleBar start={<span>B</span>}>Notes</WindowFrame.TitleBar>}
      >
        <p>Recent</p>
      </WindowFrame.Root>
      <WindowFrame.Root titleBar={bar} />
      <WindowFrame.Root>
        <WindowFrame.TitleBar>Already 1.0</WindowFrame.TitleBar>
        <WindowFrame.Content>{page}</WindowFrame.Content>
      </WindowFrame.Root>
    </>
  );
}
