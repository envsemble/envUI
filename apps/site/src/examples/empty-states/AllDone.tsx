import { useEffect, useRef, useState } from 'react';
import { Button, List, Column, Text } from '@envsemble/envui';
import { IconTaskAlt } from '@envsemble/envui/icons/TaskAlt';

export default function AllDone() {
  const [reviews, setReviews] = useState(initialReviews);
  const list = useRef<HTMLUListElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // An approved row takes its button with it, so focus moves to the next row's button, or to the
  // heading once the queue is empty.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const approve = (id: string) => {
    const index = reviews.findIndex((review) => review.id === id);
    focusNext.current = () => {
      const buttons = list.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? heading.current)?.focus();
    };
    setReviews((current) => current.filter((review) => review.id !== id));
  };

  return (
    <Column gap={4}>
      <Text render={<h3 ref={heading} tabIndex={-1} />} variant="title">
        Waiting for your review
      </Text>
      {reviews.length > 0 ? (
        <List.Root ref={list} aria-label="Reviews">
          {reviews.map((review) => (
            <List.Item
              key={review.id}
              label={review.title}
              description={`From ${review.author}`}
              end={
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`Approve ${review.title}`}
                  onClick={() => approve(review.id)}
                >
                  Approve
                </Button>
              }
            />
          ))}
        </List.Root>
      ) : (
        // A cleared queue states the fact and what comes next: no celebration, and no action.
        <Column gap={4} padding={5}>
          <Text render={<span />} emphasis="muted">
            <IconTaskAlt width="1.5rem" height="1.5rem" />
          </Text>
          <Column gap={2}>
            <Text render={<h4 />} variant="title">
              No reviews waiting
            </Text>
            <Text variant="body-sm">
              When someone asks you to review a document, it appears here.
            </Text>
          </Column>
        </Column>
      )}
    </Column>
  );
}

const initialReviews = [
  { id: 'brief', title: 'Launch brief', author: 'Alex Morgan' },
  { id: 'budget', title: 'Budget 2026', author: 'Priya Shah' },
];
