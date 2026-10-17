'use client';

import { withDisplayName } from '../../internal/withDisplayName.js';
import { Header } from './Header.js';
import { Root } from './Root.js';

export type { HeaderProps } from './Header.js';
export type { RootProps } from './Root.js';

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'PanelDock.Root');
const HeaderPart = /* @__PURE__ */ withDisplayName(Header, 'PanelDock.Header');
export { RootPart as Root, HeaderPart as Header };
