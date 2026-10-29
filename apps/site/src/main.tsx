import { createRoot } from 'react-dom/client';
import App from './App';
// After App: its envUI components bring envUI's style sheets, which declare the order of the env
// cascade layers that the site's style sheets build on.
import './styles/index.css';
import { PaletteCustomizationProvider } from './theme/PaletteCustomization';
import { findPage } from './navigation/SiteRoutes';
import { currentRoute } from './navigation/useSiteRoute';
import { preloadPage } from './pages/PreloadPage';

// The site renders once what the page it opens on needs has loaded, which started as it did, so
// its first paint has the whole page rather than the frame and then the page.
void preloadPage(findPage(currentRoute().split('?')[0]!)).then(() =>
  createRoot(document.getElementById('root')!).render(
    <PaletteCustomizationProvider>
      <App />
    </PaletteCustomizationProvider>,
  ),
);
