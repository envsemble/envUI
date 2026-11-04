import { LineArt, Surface, Theme, type ThemeContrast, type ColorScheme } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

const themes: { title: string; theme: ColorScheme; contrast: ThemeContrast }[] = [
  { title: 'Light', theme: 'light', contrast: 'standard' },
  { title: 'Dark', theme: 'dark', contrast: 'standard' },
  { title: 'Light, high contrast', theme: 'light', contrast: 'high' },
  { title: 'Dark, high contrast', theme: 'dark', contrast: 'high' },
];

/**
 * One drawing in each theme, always the muted edge color, a quiet line: on a light theme's page,
 * deeper than the light canvas, and on a dark theme's surface, lighter than the dark canvas, so
 * every box shows on the canvas in either theme.
 */
export default function Themes() {
  return (
    <Example size="collection">
      <SpecimenGrid size="small">
        {themes.map(({ title, theme, contrast }) => (
          <Specimen key={title} title={title}>
            <Theme
              theme={theme}
              contrast={contrast} // The theme's own box, rounded as the surface in it is.
              style={{
                inlineSize: '100%',
                borderRadius: 'var(--env-radius-surface)',
                overflow: 'hidden',
              }}
            >
              <Surface
                background={theme === 'light' ? 'page' : 'default'}
                padding={0}
                style={{ overflow: 'hidden', inlineSize: '100%', aspectRatio: '480 / 330' }}
              >
                <LineArt drawing="gothic-tracery" />
              </Surface>
            </Theme>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
