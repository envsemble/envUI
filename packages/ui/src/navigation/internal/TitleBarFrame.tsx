import type { ReactNode } from 'react';
import { ControlDefaults } from '../../internal/ControlDefaults.js';

/**
 * The class of a window title bar: it takes the title bar area of a window that draws its own title
 * bar over the page (the Window Controls Overlay), leaves room for the window controls the system
 * draws, drags the window by its empty space and keeps its controls clickable. WindowFrame.TitleBar
 * carries it, and so may another frame's header that is the window's title bar; its rules are in
 * WindowFrame.css.
 */
export const titleBarClassName = 'env-window-frame-title-bar';

/**
 * The defaults of the controls in a title bar: buttons that set no variant are ghost, and buttons
 * take the small control height, as the window controls beside them.
 */
export function TitleBarControls({ children }: { children?: ReactNode }) {
  return (
    <ControlDefaults variant="ghost" size="sm">
      {children}
    </ControlDefaults>
  );
}
