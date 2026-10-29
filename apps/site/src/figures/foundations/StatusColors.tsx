import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { Badge, type BadgeTone, type BadgeVariant } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { Info } from '@envsemble/envui/icons/Info';
import { RadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { Warning } from '@envsemble/envui/icons/Warning';
import { useTimeline } from '../../motion/Motion';
import { CornerLabel } from './Steps';
import { Figure } from './Topic';

/**
 * Each tone as a badge paints it, with a word in the tone and its icon:
 * Badge's tones, and Info, which only alerts and toasts take, in their colors: the accent tint of
 * an alert, soft; the strong fill of a toast, solid; the accent's edge, outlined.
 */
const tones: readonly {
  badge?: BadgeTone;
  own?: Record<BadgeVariant, CSSProperties>;
  icon: ReactNode;
  word: string;
}[] = [
  { badge: 'neutral', icon: <Archive />, word: 'Archived' },
  { badge: 'primary', icon: <RadioButtonChecked />, word: 'Current' },
  {
    own: {
      soft: {
        '--env-badge-container': 'var(--env-color-bg-primary-muted)',
        '--env-badge-content': 'var(--env-color-fg-primary)',
      } as CSSProperties,
      solid: {
        '--env-badge-container': 'var(--env-color-bg-info-strong)',
        '--env-badge-content': 'var(--env-color-fg-on-strong)',
      } as CSSProperties,
      outline: {
        '--env-badge-content': 'var(--env-color-fg-primary)',
        '--env-badge-outline': 'var(--env-color-border-primary)',
      } as CSSProperties,
    },
    icon: <Info />,
    word: 'Tip',
  },
  { badge: 'success', icon: <CheckCircle />, word: 'Ready' },
  { badge: 'warning', icon: <Warning />, word: 'Due soon' },
  { badge: 'danger', icon: <ErrorIcon />, word: 'Failed' },
  { badge: 'done', icon: <TaskAlt />, word: 'Completed' },
];

/** Badge's variants, each with its name in the corner, in the order the figure shows them. */
const badgeVariants: readonly { variant: BadgeVariant; name: string }[] = [
  { variant: 'soft', name: 'Soft' },
  { variant: 'solid', name: 'Solid' },
  { variant: 'outline', name: 'Outline' },
];

/** How long the badges stay in each variant, in ms. */
const variantStep = 2000;

/**
 * Every tone's badge side by side, all in one variant at a time: soft,
 * solid, then outlined, the variant named in the corner. The badges cut from one to the next
 * together, at one size, so nothing moves.
 */
function StatusSteps() {
  const step = useTimeline(badgeVariants.map(() => variantStep));
  const { variant, name } = badgeVariants[step] ?? badgeVariants[0]!;
  return (
    <>
      <CornerLabel>{name}</CornerLabel>
      <div className="catalogue-tone-badges">
        {tones.map((tone, index) => (
          <Fragment key={tone.word}>
            {index === 4 && <span className="catalogue-tone-break" />}
            <Badge
              tone={tone.badge ?? 'primary'}
              variant={variant}
              icon={tone.icon}
              style={tone.own?.[variant]}
            >
              {tone.word}
            </Badge>
          </Fragment>
        ))}
      </div>
    </>
  );
}

/**
 * Every tone's badge in each of Badge's variants in turn, on an animated figure: the badges' words
 * and icons say what each tone is for, so it has no legend; the tones' meanings are in Compose.
 */
export function StatusFigure() {
  return (
    <Figure label="What each color means" motion="the badges in each variant">
      <StatusSteps />
    </Figure>
  );
}
