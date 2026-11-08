import { Button, IconButton, Kbd, Row, Tooltip, useModifierKey } from '@envsemble/envui';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { preloadSearch } from './SiteSearch';

/**
 * The button that opens the documentation's search, built as the search trigger pattern shows: a
 * secondary Button with the search icon, its label and the shortcut's keys at the end, or the icon
 * alone in a ghost IconButton with the label and keys in a tooltip. The catalogue handles the
 * shortcut itself, in App. A pointer or focus on it starts loading search's index.
 */
export function SearchButton({
  iconOnly = false,
  onClick,
  className,
}: {
  iconOnly?: boolean;
  onClick: () => void;
  className?: string;
}) {
  // The keys of the search shortcut, as the button shows them, and as aria-keyshortcuts names them.
  const modifier = useModifierKey();
  const keys = [modifier.label, 'K'];
  const ariaKeyShortcuts = `${modifier.key}+K`;
  if (iconOnly)
    return (
      <Tooltip
        side="bottom"
        content={
          <Row render={<span />} align="center" gap={2}>
            Search <Kbd keys={keys} />
          </Row>
        }
      >
        <IconButton
          variant="ghost"
          icon={<IconSearch />}
          aria-label="Search"
          aria-keyshortcuts={ariaKeyShortcuts}
          onClick={onClick}
          onPointerEnter={preloadSearch}
          onFocus={preloadSearch}
          className={className}
        />
      </Tooltip>
    );
  return (
    <Button
      variant="secondary"
      startIcon={<IconSearch />}
      // The keys show for a keyboard alone: a touch screen has none (Shell.css).
      end={<Kbd keys={keys} aria-hidden className="site-search-keys" />}
      aria-keyshortcuts={ariaKeyShortcuts}
      onClick={onClick}
      onPointerEnter={preloadSearch}
      onFocus={preloadSearch}
      className={className}
    >
      Search
    </Button>
  );
}
