import { LineArt, Surface, Theme, type ThemeContrast, type ColorScheme } from '@envsemble/envui';
import { SpecimenFrame, SpecimenGrid, SpecimenPart } from '../../figures/SpecimenFrame';

const themes: { title: string; theme: ColorScheme; contrast: ThemeContrast }[] = [
  { title: 'Light', theme: 'light', contrast: 'standard' },
  { title: 'Dark', theme: 'dark', contrast: 'standard' },
  { title: 'Light, high contrast', theme: 'light', contrast: 'high' },
  { title: 'Dark, high contrast', theme: 'dark', contrast: 'high' },
];

export default function Themes() {
  return (
    <SpecimenFrame size="collection">
      <SpecimenGrid size="small">
        {themes.map(({ title, theme, contrast }) => (
          <SpecimenPart key={title} title={title}>
            <Theme
              theme={theme}
              contrast={contrast}
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
          </SpecimenPart>
        ))}
      </SpecimenGrid>
    </SpecimenFrame>
  );
}
