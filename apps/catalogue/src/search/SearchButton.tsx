import { Button, IconButton, Kbd, Row, Tooltip } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';
import { applePlatform, commandKey } from './SearchShortcut';

/** The keys of the search shortcut, as the button shows them, and as aria-keyshortcuts names them. */
const keys = [commandKey, 'K'];
const ariaKeyShortcuts = applePlatform ? 'Meta+K' : 'Control+K';

/**
 * The button that opens the documentation's search, built as the search trigger pattern shows: a
 * secondary Button with the search icon, its label and the shortcut's keys at the end, or the icon
 * alone in a ghost IconButton with the label and keys in a tooltip. The catalogue handles the
 * shortcut itself, in App.
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
          icon={<Search />}
          aria-label="Search"
          aria-keyshortcuts={ariaKeyShortcuts}
          onClick={onClick}
          className={className}
        />
      </Tooltip>
    );
  return (
    <Button
      variant="secondary"
      startIcon={<Search />}
      end={<Kbd keys={keys} aria-hidden />}
      aria-keyshortcuts={ariaKeyShortcuts}
      onClick={onClick}
      className={className}
    >
      Search
    </Button>
  );
}
