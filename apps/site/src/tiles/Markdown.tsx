import { useLayoutEffect, useRef } from 'react';
import { Markdown } from '@envsemble/envui/content';
import { useTimeline } from '../previews/Motion';

const note = (link: string) => `### Release notes

- **Faster** search
- New ${link}
`;

/** The last item's link, as its source is written. */
const link = '[guide](/guide)';

/*
 * The last item's link written again, as a note being edited: its source taken back to the word
 * before it, then typed again a character at a time, raw until its closing parenthesis turns it
 * into a link. Each step is the source of the link so far, and how long it shows.
 */
const steps = [
  { source: link, duration: 700 },
  ...[...link].map((_, index) => ({
    source: link.slice(0, link.length - 1 - index),
    duration: index === link.length - 1 ? 450 : 35,
  })),
  ...[...link].map((_, index) => ({
    source: link.slice(0, index + 1),
    duration: index === link.length - 1 ? 1400 : 85,
  })),
];
const durations = steps.map(({ duration }) => duration);

/**
 * A short note rendered from Markdown: a heading and a list, with bold text and a link. While its
 * source is raw, which runs wider, it keeps the still's width, so the note stays where it is.
 */
export default function MarkdownTile() {
  const step = useTimeline(durations);
  const root = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  useLayoutEffect(() => {
    if (step === 0 && root.current) width.current = root.current.offsetWidth;
  });
  const raw = step !== 0 && width.current > 0;
  return (
    <Markdown
      ref={root}
      style={raw ? { inlineSize: width.current, whiteSpace: 'nowrap' } : undefined}
    >
      {note(steps[step].source)}
    </Markdown>
  );
}
