import type { ReactNode } from 'react';
import { Button, Column, Page, Scaffold, Text, TopBar } from '@envsemble/envui';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';
import { IconWifiOff } from '@envsemble/envui/icons/WifiOff';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

/** The three reasons a whole page can't show, each with its own way on. */
const cases: { icon: ReactNode; title: string; text: string; action: string }[] = [
  {
    icon: <IconSearchOff width="2.5rem" height="2.5rem" />,
    title: 'Page not found',
    text: 'The address may be mistyped, or the page may have moved. Check it, or go back to Home.',
    action: 'Go to Home',
  },
  {
    icon: <IconLock width="2.5rem" height="2.5rem" />,
    title: 'You don’t have access to this page',
    text: 'Ask Priya Shah, its owner, for access to see it.',
    action: 'Request access',
  },
  {
    icon: <IconWifiOff width="2.5rem" height="2.5rem" />,
    title: 'You’re offline',
    text: 'Your work is safe. Check your connection and try again.',
    action: 'Try again',
  },
];

function Cases() {
  // Each case a while to read, the frame staying as the page in it changes. The still, step 0,
  // is the first case too, left at once as the figure starts to play.
  const step = useTimeline([10, 5000, 5000, 5000]);
  const index = Math.max(0, step - 1);
  const shown = cases[index];
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '22rem' }}
      topBar={<TopBar title="Northwind" />}
    >
      <Page>
        <Renew round={index}>
          <Column
            gap={4}
            padding={5}
            align="center"
            justify="center"
            style={{ textAlign: 'center' }}
          >
            <Text render={<span />} emphasis="muted">
              {shown.icon}
            </Text>
            <Column gap={2} align="center" style={{ maxInlineSize: '30rem' }}>
              <Text render={<h4 />} variant="title">
                {shown.title}
              </Text>
              <Text variant="body-sm">{shown.text}</Text>
            </Column>
            <Button variant="secondary">{shown.action}</Button>
          </Column>
        </Renew>
      </Page>
    </Scaffold>
  );
}

/** The frame that stays, with a page that can't show for each of three reasons in turn. */
export default function WholePage() {
  return (
    <MotionStage label="the three whole-page states" stage="shaded">
      <Cases />
    </MotionStage>
  );
}
