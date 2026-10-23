import { useState } from 'react';
import { Avatar, Checkbox, EnvUIProvider, Link, List, Column } from '@envsemble/envui';

const slides = ['Intro', 'Roadmap', 'Budget', 'Questions'];

/** Moves the item at `from` to `to`. */
function moved<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** A reorderable list of slides, each opening from its title. */
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
            selected={slide === current}
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

/** A row component, as an application writes one, which passes the props it doesn't use on. */
function SlideRow({ slide, ...props }: { slide: string } & Omit<List.ItemProps, 'label'>) {
  return <List.Item {...props} label={slide} description="Slide" />;
}

/** A row component that drops the props it doesn't use, so its row gets no handle. */
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

/** Slides in row components, which pass their props on, or with `bare`, drop them. */
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

/**
 * Lists, mounted with ?fixture=lists: reorderable slides with a current one, the same in
 * right-to-left text, slides in a row component, people with avatars in the start slot, and rows
 * chosen by checkboxes. With &bare-rows, slides in a row component that drops List.Root's props.
 */
export function ListsFixture() {
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
