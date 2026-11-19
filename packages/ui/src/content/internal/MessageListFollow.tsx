'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../actions/Button.js';
import { message as messageMessages } from '../../foundations/messages/message.js';
import { IconArrowDownward } from '../../icons/ArrowDownward.js';
import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import '../../styles/Base.css';
import '../../styles/Button.css';
import '../../styles/Message.css';

const endSlack = 8;

export function MessageListFollow({ label }: { label: string | undefined }) {
  const messages = useMessages('message', messageMessages);
  const anchor = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const [unseen, setUnseen] = useState(false);

  useLayoutEffect(() => {
    const list = anchor.current?.parentElement;
    if (!list) return;
    let lastTop = list.scrollTop;
    let lastHeight = list.scrollHeight;
    const atEnd = () => list.scrollHeight - list.scrollTop - list.clientHeight <= endSlack;
    const toEnd = () => {
      list.scrollTop = list.scrollHeight;
    };
    const onScroll = () => {
      if (atEnd()) {
        following.current = true;
        setUnseen(false);
      } else if (list.scrollTop < lastTop) following.current = false;
      lastTop = list.scrollTop;
    };
    const onResize = () => {
      const grew = list.scrollHeight > lastHeight;
      lastHeight = list.scrollHeight;
      if (following.current) toEnd();
      else if (grew) setUnseen(true);
    };
    const resize = new ResizeObserver(onResize);
    const observe = () => {
      resize.observe(list);
      for (const child of list.children) resize.observe(child);
    };
    const mutation = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.removedNodes)
          if (node.nodeType === Node.ELEMENT_NODE) resize.unobserve(node as Element);
      observe();
      onResize();
    });
    toEnd();
    observe();
    mutation.observe(list, { childList: true });
    list.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
      list.removeEventListener('scroll', onScroll);
    };
  }, []);

  function jump() {
    const list = anchor.current?.parentElement;
    if (!list) return;
    following.current = true;
    setUnseen(false);
    list.focus({ preventScroll: true });
    list.scrollTo({
      top: list.scrollHeight,
      behavior: prefersReducedMotion(list.ownerDocument.defaultView ?? undefined)
        ? 'auto'
        : 'smooth',
    });
  }

  return (
    <div ref={anchor} className="env-message-list-jump" aria-live="off">
      {unseen && (
        <Button variant="primary" size="sm" start={<IconArrowDownward />} onClick={jump}>
          {label ?? messages.jumpToLatest}
        </Button>
      )}
    </div>
  );
}
