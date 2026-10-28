import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Column,
  Kbd,
  Link,
  Progress,
  Row,
  Surface,
  Text,
  Theme,
  useTheme,
} from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Share } from '@envsemble/envui/icons/Share';
import { routeHref } from '../../navigation/Address';
import { useInView } from '../../previews/Motion';
import { useDisplaySettings } from '../../theme/DisplaySettings';
import { foundations } from './Foundations';

/** How long the screen shows each foundation while it plays on its own, in ms. */
const showFor = 2800;

/**
 * One screen built with envUI, which each foundation changes in its own way when it is chosen:
 * Colors switches it to the other theme, Spacing to the other scale, Adapting to width narrows it,
 * and Typography, Icons and Accessibility pick out their parts.
 */
function Screen({ shown }: { shown: string | undefined }) {
  const { theme, scale } = useTheme();
  return (
    <div className="catalogue-foundations-screen" data-shown={shown} aria-hidden="true" inert>
      <Theme
        theme={shown === 'colors' ? (theme === 'dark' ? 'light' : 'dark') : theme}
        scale={shown === 'spacing' ? (scale === 'compact' ? 'comfortable' : 'compact') : scale}
        className="catalogue-foundations-screen-theme"
      >
        <Surface
          background="default"
          padding={6}
          radius="xl"
          className="catalogue-foundations-screen-surface"
          render={<Column gap={5} />}
        >
          <Row gap={3} align="center" wrap>
            <span data-part="icon" className="catalogue-foundations-screen-icon">
              <Folder />
            </span>
            <Text render={<p />} variant="title" data-part="type">
              Website refresh
            </Text>
            <Badge tone="success">On track</Badge>
          </Row>
          <Column gap={2}>
            <Text render={<p />} data-part="type">
              The new pages go live on 4 March, after the last review.
            </Text>
            <Text render={<p />} variant="body-sm" emphasis="muted" data-part="type">
              Updated today by Priya Shah
            </Text>
          </Column>
          <Progress label="Tasks" value={18} max={24} valueText="18 of 24" />
          <Row gap={3} justify="end" wrap>
            <Button variant="secondary" startIcon={<Share data-part="icon" />}>
              Share
            </Button>
            <span data-part="focus" className="catalogue-foundations-screen-focus">
              <Button variant="primary">Open project</Button>
            </span>
          </Row>
        </Surface>
      </Theme>
      <span className="catalogue-foundations-screen-key">
        <Kbd keys={['Tab']} />
      </span>
    </div>
  );
}

/**
 * Proposal D: one screen, taken apart. The foundations are listed beside a screen built with envUI,
 * and the one chosen shows on it: pointing at a foundation or moving to it with the keyboard picks
 * it, and while none is, the screen plays through them on its own, unless animations are paused.
 */
export function DesignScreen() {
  const [picked, setPicked] = useState<string>();
  const [playing, setPlaying] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);
  const { motionPaused } = useDisplaySettings();
  const plays = inView && !motionPaused && picked === undefined;
  useEffect(() => {
    if (!plays) return;
    const timer = setInterval(
      () => setPlaying((current) => (current + 1) % foundations.length),
      showFor,
    );
    return () => clearInterval(timer);
  }, [plays]);
  const shown = picked ?? (motionPaused ? undefined : foundations[playing]!.id);
  return (
    <div className="catalogue-foundations-apart">
      <div
        ref={stage}
        className="site-foundation-stage catalogue-foundations-apart-stage"
        data-figure="example"
      >
        <Screen shown={shown} />
      </div>
      <ul
        className="catalogue-foundations-list"
        onPointerLeave={() => setPicked(undefined)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPicked(undefined);
        }}
      >
        {foundations.map((foundation, index) => (
          <li
            key={foundation.id}
            className="catalogue-foundations-item"
            data-shown={shown === foundation.id || undefined}
            onPointerEnter={() => {
              setPicked(foundation.id);
              setPlaying(index);
            }}
            onFocus={() => {
              setPicked(foundation.id);
              setPlaying(index);
            }}
          >
            <Text render={<h2 />} variant="title" className="catalogue-foundations-item-name">
              <Link
                href={routeHref(foundation.path)}
                underline={false}
                className="catalogue-foundations-item-link"
              >
                {foundation.title}
              </Link>
            </Text>
            <Text render={<p />} variant="body-sm" emphasis="muted">
              {foundation.summary}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
