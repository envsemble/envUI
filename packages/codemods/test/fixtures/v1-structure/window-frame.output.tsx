import { useRef } from 'react';
import { WindowFrame } from '@envsemble/envui';

export function StartPage({ bar, page }) {
  const scroller = useRef(null);
  return (
    <>
      <WindowFrame.Root className="start">
        <WindowFrame.TitleBar start={<span>B</span>}>Notes</WindowFrame.TitleBar>
        <WindowFrame.Content ref={scroller}>
          <p>Recent</p>
        </WindowFrame.Content>
      </WindowFrame.Root>
      <WindowFrame.Root>
        {bar}
        <WindowFrame.Content />
      </WindowFrame.Root>
      <WindowFrame.Root>
        <WindowFrame.TitleBar>Already 1.0</WindowFrame.TitleBar>
        <WindowFrame.Content>{page}</WindowFrame.Content>
      </WindowFrame.Root>
    </>
  );
}
