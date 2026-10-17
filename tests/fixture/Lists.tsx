import { useState } from 'react';
import { Avatar, Checkbox, EnvUIProvider, Link, List, Stack } from '@envsemble/envui';

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
    <Stack gap={2}>
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
    </Stack>
  );
}

/**
 * Lists, mounted with ?fixture=lists: reorderable slides with a current one, the same in
 * right-to-left text, people with avatars in the start slot, and rows chosen by checkboxes.
 */
export function ListsFixture() {
  const [checked, setChecked] = useState<string[]>(['Sam Lee']);
  return (
    <Stack gap={5} className="fixture-section" style={{ inlineSize: '24rem' }}>
      <Slides testId="slides" />
      <EnvUIProvider dir="rtl">
        <div dir="rtl">
          <Slides testId="slides-rtl" />
        </div>
      </EnvUIProvider>
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
    </Stack>
  );
}
