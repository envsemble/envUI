import { useState } from 'react';
import { Link, Sheet, Text } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

const text =
  'See the [launch plan](/documents/launch-plan) and the [pricing research](/documents/pricing), ' +
  'or the [public changelog](https://example.com/changelog).';

/** The application's documents, which open in its side panel. */
const documents: Record<string, { title: string; summary: string }> = {
  '/documents/launch-plan': {
    title: 'Launch plan',
    summary:
      'The spring launch, step by step: pricing, release notes and the launch-day checklist.',
  },
  '/documents/pricing': {
    title: 'Pricing research',
    summary: 'Interviews with twelve teams about how they choose a plan.',
  },
};

export default function OpenInPanel() {
  const [open, setOpen] = useState(false);
  // The document shown, which stays in the panel while it slides out.
  const [href, setHref] = useState<string | null>(null);
  const shown = href ? documents[href] : undefined;
  return (
    <>
      <div style={{ inlineSize: 'min(100%, 19rem)' }}>
        <Markdown
          renderLink={({ href: target, children, ...props }) => (
            <Link
              {...props}
              href={target}
              onClick={(event) => {
                // Plain clicks on documents open the panel; modified clicks keep the browser's.
                const plain =
                  event.button === 0 &&
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey &&
                  !event.altKey;
                if (plain && documents[target]) {
                  event.preventDefault();
                  setHref(target);
                  setOpen(true);
                }
              }}
            >
              {children}
            </Link>
          )}
        >
          {text}
        </Markdown>
      </div>
      <Sheet
        open={open && shown !== undefined}
        onOpenChange={setOpen}
        modal={false}
        disablePointerDismissal
        title={shown?.title ?? 'Document'}
        closeLabel="Close document"
      >
        <Text>{shown?.summary}</Text>
      </Sheet>
    </>
  );
}
