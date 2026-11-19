import { useState } from 'react';
import { Avatar, Button, Checkbox, EnvUIProvider, Link, List, Column } from '@envsemble/envui';

export const mount = 'standalone';

const slides = ['Intro', 'Roadmap', 'Budget', 'Questions'];

function moved<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

function Slides({ testId }: { testId: string }) {
  const [items, setItems] = useState(slides);
  const [current, setCurrent] = useState('Roadmap');
  return (
    <Column gap={2}>
      <List.Root
        aria-label={`Slides ${testId}`}
        data-testid={testId}
        onReorder={(from, to) => setItems((list) => moved(list, from, to))}
      >
        {items.map((slide) => (
          <List.Item
            key={slide}
            interactive
            current={slide === current}
            label={
              <Link
                href={`#${slide.toLowerCase()}`}
                data-row-target
                draggable={false}
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(slide);
                }}
              >
                {slide}
              </Link>
            }
            description="Slide"
          />
        ))}
      </List.Root>
      <output data-testid={`${testId}-order`}>{items.join(',')}</output>
    </Column>
  );
}

function SlideRow({ slide, ...props }: { slide: string } & Omit<List.ItemProps, 'label'>) {
  return <List.Item {...props} label={slide} description="Slide" />;
}

function BareSlideRow({ slide }: { slide: string }) {
  return (
    <List.Item
      interactive
      label={
        <a href={`#${slide.toLowerCase()}`} data-row-target>
          {slide}
        </a>
      }
    />
  );
}

function WrappedSlides({ bare = false }: { bare?: boolean }) {
  const [items, setItems] = useState(slides);
  const testId = bare ? 'bare-slides' : 'wrapped-slides';
  return (
    <Column gap={2}>
      <List.Root
        aria-label={`Slides ${testId}`}
        data-testid={testId}
        onReorder={(from, to) => setItems((list) => moved(list, from, to))}
      >
        {items.map((slide) =>
          bare ? (
            <BareSlideRow key={slide} slide={slide} />
          ) : (
            <SlideRow key={slide} slide={slide} />
          ),
        )}
      </List.Root>
      <output data-testid={`${testId}-order`}>{items.join(',')}</output>
    </Column>
  );
}

export default function ListFixture() {
  const [checked, setChecked] = useState<string[]>(['Sam Lee']);
  return (
    <Column gap={5} className="fixture-section" style={{ inlineSize: '24rem' }}>
      <Slides testId="slides" />
      <EnvUIProvider dir="rtl">
        <div dir="rtl">
          <Slides testId="slides-rtl" />
        </div>
      </EnvUIProvider>
      <WrappedSlides />
      {new URLSearchParams(location.search).has('bare-rows') && <WrappedSlides bare />}
      <List.Root aria-label="Plans">
        <List.Item
          interactive
          label={
            <Button variant="text" data-row-target>
              Hiring plan 2027
            </Button>
          }
          description="Sam Lee"
        />
      </List.Root>
      <List.Root aria-label="Edits">
        <List.Item
          interactive
          label={
            <a href="#report" data-row-target>
              Quarterly report
            </a>
          }
          description={
            <>
              Edited by <a href="#alex">Alex Morgan</a>
            </>
          }
        />
      </List.Root>
      <List.Root aria-label="People">
        {['Alex Morgan', 'Sam Lee'].map((name) => (
          <List.Item
            key={name}
            start={<Avatar name={name} size="sm" />}
            label={name}
            description="Editor"
          />
        ))}
      </List.Root>
      <List.Root aria-label="Reviewers">
        {['Alex Morgan', 'Sam Lee', 'Priya Shah'].map((name) => (
          <List.Item
            key={name}
            start={
              <Checkbox
                aria-label={`Choose ${name}`}
                checked={checked.includes(name)}
                onCheckedChange={(on) =>
                  setChecked((list) =>
                    on ? [...list, name] : list.filter((each) => each !== name),
                  )
                }
              />
            }
            label={name}
          />
        ))}
      </List.Root>
    </Column>
  );
}
