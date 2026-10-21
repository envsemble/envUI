import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, List, Column, Text } from '@envsemble/envui';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';

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
              action={
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
        <EmptyState
          icon={<TaskAlt />}
          title="No reviews waiting"
          description="When someone asks you to review a document, it appears here."
        />
      )}
    </Column>
  );
}

const initialReviews = [
  { id: 'brief', title: 'Launch brief', author: 'Alex Morgan' },
  { id: 'budget', title: 'Budget 2026', author: 'Priya Shah' },
];
