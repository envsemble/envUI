import { createRoot } from 'react-dom/client';
import App from './App';
// After App: its envUI components bring envUI's style sheets, which declare the order of the env
// cascade layers that the site's style sheets build on.
import './styles/index.css';
import { PaletteCustomizationProvider } from './display/PaletteCustomization';
import { findPage } from './routes/SiteRoutes';
import { currentRoute } from './routes/useSiteRoute';
import { preloadPage } from './pages/PreloadPage';
// The site renders once what the page it opens on needs has loaded, which started as it did, so
// its first paint has the whole page rather than the frame and then the page.
void preloadPage(findPage(currentRoute().split('?')[0])).then(() =>
  // index.html holds the root.
  createRoot(document.getElementById('root')!).render(
    <PaletteCustomizationProvider>
      <App />
    </PaletteCustomizationProvider>,
  ),
);

// Those modules serve the start alone: a change to them, such as the documentation's while
// developing, updates the pages that use them in place rather than loading the site again.
import.meta.hot?.accept(
  ['./routes/SiteRoutes', './routes/useSiteRoute', './pages/PreloadPage'],
  () => {},
);
