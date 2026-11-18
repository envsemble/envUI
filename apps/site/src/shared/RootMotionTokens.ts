import {
  easingFunction,
  motionDuration,
  motionEasing,
  type MotionDuration,
  type MotionEasing,
} from '@envui-internal/internal/motion/motionTokens';

const root = () => (typeof document === 'undefined' ? null : document.documentElement);

const tokensSinceRootChanged = new Map<string, number | string>();
let rootChanges: MutationObserver | null = null;

function rootToken<T extends number | string>(
  name: string,
  read: (element: Element) => T,
  withoutDocument: T,
): T {
  const element = root();
  if (!element) return withoutDocument;
  const canWatchRoot = typeof MutationObserver !== 'undefined';
  if (!canWatchRoot) return read(element);
  if (!rootChanges) {
    rootChanges = new MutationObserver(() => tokensSinceRootChanged.clear());
    rootChanges.observe(element, { attributes: true });
  }
  if (rootChanges.takeRecords().length) tokensSinceRootChanged.clear();
  if (!tokensSinceRootChanged.has(name)) tokensSinceRootChanged.set(name, read(element));
  return tokensSinceRootChanged.get(name) as T;
}

export const rootMotionDuration = (speed: MotionDuration) =>
  rootToken(`duration ${speed}`, (element) => motionDuration(element, speed), 0);

const rootEasing = (name: MotionEasing) =>
  rootToken(`easing ${name}`, (element) => motionEasing(element, name), 'ease');

export function rootMotionEasing(name: MotionEasing = 'ease') {
  const value = rootEasing(name);
  return typeof CSS !== 'undefined' && CSS.supports('animation-timing-function', value)
    ? value
    : 'ease';
}

export const rootEasingFunction = (name: MotionEasing = 'ease') => easingFunction(rootEasing(name));
