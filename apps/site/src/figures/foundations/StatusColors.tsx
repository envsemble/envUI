import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { Badge, type BadgeTone, type BadgeVariant } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconError } from '@envsemble/envui/icons/Error';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { IconRadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { IconTaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { IconWarning } from '@envsemble/envui/icons/Warning';
import { useTimeline } from '../../motion/Timeline';
import { CornerLabel } from './Steps';
import { FoundationFrame } from './FoundationFrame';

const tones: readonly {
  badge?: BadgeTone;
  own?: Record<BadgeVariant, CSSProperties>;
  icon: ReactNode;
  word: string;
}[] = [
  { badge: 'neutral', icon: <IconArchive />, word: 'Archived' },
  { badge: 'primary', icon: <IconRadioButtonChecked />, word: 'Current' },
  {
    own: {
      soft: {
        '--env-badge-container': 'var(--env-color-bg-primary-muted)',
        '--env-badge-content': 'var(--env-color-fg-primary)',
      },
      solid: {
        '--env-badge-container': 'var(--env-color-bg-info-strong)',
        '--env-badge-content': 'var(--env-color-fg-on-strong)',
      },
      outline: {
        '--env-badge-content': 'var(--env-color-fg-primary)',
        '--env-badge-outline': 'var(--env-color-border-primary)',
      },
    },
    icon: <IconInfo />,
    word: 'Tip',
  },
  { badge: 'success', icon: <IconCheckCircle />, word: 'Ready' },
  { badge: 'warning', icon: <IconWarning />, word: 'Due soon' },
  { badge: 'danger', icon: <IconError />, word: 'Failed' },
  { badge: 'done', icon: <IconTaskAlt />, word: 'Completed' },
];

const badgeVariants: readonly { variant: BadgeVariant; name: string }[] = [
  { variant: 'soft', name: 'Soft' },
  { variant: 'solid', name: 'Solid' },
  { variant: 'outline', name: 'Outline' },
];

const variantStepMs = 1200;

const badgesOnFirstLine = 4;

function StatusSteps() {
  const step = useTimeline(badgeVariants.map(() => variantStepMs));
  const { variant, name } = badgeVariants[step] ?? badgeVariants[0]!;
  return (
    <>
      <CornerLabel>{name}</CornerLabel>
      <div className="catalogue-tone-badges">
        {tones.map((tone, index) => (
          <Fragment key={tone.word}>
            {index === badgesOnFirstLine && <span className="catalogue-tone-break" />}
            <Badge
              tone={tone.badge ?? 'primary'}
              variant={variant}
              start={tone.icon}
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

export function StatusFigure() {
  return (
    <FoundationFrame label="What each color means" motion="the badges in each variant">
      <StatusSteps />
    </FoundationFrame>
  );
}
