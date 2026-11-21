import { useRef, useState } from 'react';
import {
  Button,
  Dialog,
  LinkProvider,
  TableOfContents,
  type LinkComponentProps,
} from '@envsemble/envui';

export const mount = 'standalone';

const tall = { blockSize: '40rem', margin: 0 };
const short = { blockSize: '3rem', margin: 0 };

export default function TableOfContentsFixture() {
  const article = useRef<HTMLElement>(null);
  const [extra, setExtra] = useState(false);
  const [round, setRound] = useState(0);
  return (
    <div>
      <style>{`.toc-fixture-article :is(h2, h3) { scroll-margin-block-start: 4.5rem; }`}</style>
      <div
        data-testid="bar"
        style={{
          position: 'sticky',
          insetBlockStart: 0,
          blockSize: '4rem',
          zIndex: 1,
          background: 'var(--env-color-bg-page)',
        }}
      >
        <button type="button" onClick={() => setExtra(true)}>
          Add a section
        </button>
        <button type="button" onClick={() => setRound((count) => count + 1)}>
          Render the review again
        </button>
        <Dialog
          title="Add from a dialog"
          closeLabel="Close"
          trigger={<Button>Open a dialog</Button>}
          actions={<Button onClick={() => setExtra(true)}>Add a section</Button>}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 14rem', gap: '2rem' }}>
        <article ref={article} className="toc-fixture-article">
          <h2 id="introduction">Introduction</h2>
          <p style={tall}>The start.</p>
          <h3>Install the package</h3>
          <p style={tall}>Install it.</p>
          <h3 id="configure">
            Configure <span aria-hidden="true">#</span>
          </h3>
          <p style={tall}>Configure it.</p>
          <h2 id="usage">Usage</h2>
          <div data-example="">
            <h2>Example heading</h2>
          </div>
          <h4>Deep detail</h4>
          <p style={tall}>Use it.</p>
          {extra && <h2 id="added">Added later</h2>}
          <h2 id="short-end">Short end</h2>
          <p style={short}>Nearly done.</p>
          <h2 id="last">Last</h2>
          <p style={short}>Done.</p>
        </article>
        <aside style={{ position: 'sticky', insetBlockStart: '4rem', alignSelf: 'start' }}>
          <TableOfContents
            container={article}
            filter={(heading) => !heading.closest('[data-example]')}
          />
          <TableOfContents
            aria-label="Review"
            items={[
              { id: 'review-summary', label: 'Summary' },
              {
                id: 'review-results',
                label: 'Results',
                children: [{ id: 'review-costs', label: 'Costs' }],
              },
            ]}
          />
          <div data-testid="review" tabIndex={0} style={{ blockSize: '12rem', overflow: 'auto' }}>
            <div key={round}>
              <section id="review-summary" style={{ blockSize: '20rem' }}>
                The year in brief.
              </section>
              <section id="review-results" style={{ blockSize: '20rem' }}>
                Revenue and costs.
              </section>
              <section id="review-costs" style={{ blockSize: '4rem' }}>
                Costs went down.
              </section>
            </div>
          </div>
          <div style={{ transform: 'scale(0.5)', transformOrigin: '0 0' }}>
            <TableOfContents
              aria-label="At half size"
              items={[
                { id: 'scaled-summary', label: 'Summary' },
                { id: 'scaled-results', label: 'Results' },
                { id: 'scaled-costs', label: 'Costs' },
              ]}
            />
            <div data-testid="scaled" style={{ blockSize: '12rem', overflow: 'auto' }}>
              <section id="scaled-summary" style={{ blockSize: '20rem' }}>
                The year in brief.
              </section>
              <section id="scaled-results" style={{ blockSize: '20rem' }}>
                Revenue and costs.
              </section>
              <section id="scaled-costs" style={{ blockSize: '4rem' }}>
                Costs went down.
              </section>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RecordingRouterLink({ onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        document.body.dataset.routedTo = props.href;
      }}
    />
  );
}

export function RoutedContentsFixture() {
  const [handled, setHandled] = useState('');
  return (
    <LinkProvider component={RecordingRouterLink}>
      <TableOfContents
        aria-label="Routed"
        items={[
          { id: 'routed-first', label: 'First' },
          { id: 'routed-second', label: 'Second' },
          { id: 'routed-own', label: 'Handled by the application' },
        ]}
        onNavigate={(id, event) => {
          if (id !== 'routed-own') return;
          event.preventDefault();
          setHandled(id);
        }}
      />
      <output data-testid="handled">{handled}</output>
      <section id="routed-first" style={tall}>
        First
      </section>
      <section id="routed-second" style={tall}>
        Second
      </section>
      <section id="routed-own" style={tall}>
        Own
      </section>
    </LinkProvider>
  );
}
