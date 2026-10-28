import { useEffect, type RefObject } from 'react';
import { usePlayback } from './Motion';

/**
 * Holds the CSS animations of an element and everything in it while its preview doesn't play, such
 * as a paused figure's, so a motion that runs on its own clock, as LineArt's lines do, stops where
 * it is and goes on from there; those that start meanwhile hold as they start.
 */
export function useHeldAnimations(element: RefObject<Element | null>) {
  const { playing } = usePlayback();
  useEffect(() => {
    const target = element.current;
    if (!target) return;
    const animations = () => target.getAnimations({ subtree: true });
    if (playing) {
      for (const animation of animations()) animation.play();
      return;
    }
    const hold = () => {
      for (const animation of animations()) animation.pause();
    };
    hold();
    target.addEventListener('animationstart', hold);
    return () => target.removeEventListener('animationstart', hold);
  }, [element, playing]);
}
