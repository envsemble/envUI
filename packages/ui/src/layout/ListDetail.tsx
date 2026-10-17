'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button } from '../actions/Button.js';
import { ArrowBack } from '../icons/ArrowBack.js';
import { classNames } from '../internal/classNames.js';
import { cssLength } from '../internal/cssLength.js';
import { setRef } from '../internal/setRef.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { useSplitPane } from './internal/SplitPaneContext.js';
import { defaultStackBelow, StackStyle } from './internal/StackStyle.js';
import * as SplitPane from './SplitPane.js';

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * Whether the detail is what people are looking at, such as after choosing an item. A stacked
   * layout shows the detail instead of the list while it is true; side by side, both show.
   */
  detailShown: boolean;
  /** Called by the back button of a stacked detail; set detailShown to false in it. */
  onBack: () => void;
  /**
   * The back button's label, which names where it goes, such as All projects. It depends on the
   * content, so there is no default.
   */
  backLabel: string;
  /**
   * A width, such as '44rem', or a number of pixels: while the layout itself is narrower, it shows
   * the list or the detail, one at a time.
   * @default '44rem'
   */
  stackBelow?: string | number;
  /**
   * The list's share of the width in percent until people resize it.
   * @default 32
   */
  defaultListSize?: number;
  /**
   * The list's smallest share of the width in percent.
   * @default 22
   */
  minListSize?: number;
  /**
   * The list's largest share of the width in percent.
   * @default 50
   */
  maxListSize?: number;
  /**
   * The name of the handle that resizes the list, such as Resize project list.
   * @default 'Resize panes', or EnvUIProvider's messages.splitPane.resize
   */
  resizeLabel?: string;
  /** Keeps the list's width under this localStorage key. */
  persist?: string;
  /** The list and the detail: ListDetail.List, then ListDetail.Detail. */
  children: ReactNode;
}

export interface ListProps extends ComponentPropsWithRef<'div'> {
  /** Names the list's region, such as Projects. */
  label: string;
}

export interface DetailProps extends ComponentPropsWithRef<'div'> {
  /** Names the detail's region, such as the chosen item's name. */
  label?: string;
}

interface ListDetailContextValue {
  detailShown: boolean;
  onBack: () => void;
  backLabel: string;
  resizeLabel: string | undefined;
  listRef: RefObject<HTMLDivElement | null>;
}

const ListDetailContext = createContext<ListDetailContextValue | null>(null);

function useListDetail(part: string) {
  const context = useContext(ListDetailContext);
  if (!context) throw new Error(`ListDetail.${part} must be inside ListDetail.Root.`);
  return context;
}

/** Focus on the list's current row, else on the list itself. */
function focusCurrentRow(list: HTMLElement | null) {
  if (!list) return;
  const current = list.querySelector<HTMLElement>('[aria-current]:not([aria-current="false"])');
  const target =
    current?.matches(':is(a[href], button, [tabindex])') === true
      ? current
      : (current?.querySelector<HTMLElement>('a[href], button, [tabindex]') ?? current);
  if (target && target.tabIndex >= 0) target.focus();
  else {
    if (!list.hasAttribute('tabindex')) list.tabIndex = -1;
    list.focus();
  }
}

/**
 * The stacked rules for one stackBelow width, which ListDetail.css carries for 44rem: the list or the
 * detail, by data-detail-shown, without a hairline above the detail.
 */
const stackRules = (width: string) =>
  `.env-list-detail${width}[data-detail-shown]>.env-list-detail-list{display:none}` +
  `.env-list-detail${width}:not([data-detail-shown])>.env-list-detail-detail{display:none}` +
  `.env-list-detail${width}>.env-list-detail-list:not([hidden])~.env-list-detail-detail:not([hidden]){` +
  'border-block-start:none}';

/**
 * A list beside the detail of its chosen item, on SplitPane, with the list's width resizable. Below
 * `stackBelow` of its own width it shows one at a time: the list, or the detail with a back button,
 * which moves focus between them.
 */
function Root({
  detailShown,
  onBack,
  backLabel,
  stackBelow = defaultStackBelow,
  defaultListSize = 32,
  minListSize = 22,
  maxListSize = 50,
  persist,
  resizeLabel,
  className,
  children,
  ...props
}: RootProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const context = useMemo(
    () => ({ detailShown, onBack, backLabel, resizeLabel, listRef }),
    [detailShown, onBack, backLabel, resizeLabel],
  );
  return (
    <ListDetailContext value={context}>
      <SplitPane.Root
        {...props}
        className={classNames('env-list-detail', className)}
        stackBelow={stackBelow}
        defaultSize={defaultListSize}
        minSize={minListSize}
        maxSize={maxListSize}
        persist={persist}
        data-detail-shown={detailShown ? '' : undefined}
      >
        {children}
        <StackStyle name="env-list-detail" stackBelow={cssLength(stackBelow)} rules={stackRules} />
      </SplitPane.Root>
    </ListDetailContext>
  );
}

/** The list pane, a region named by its label. Stacked, it hides while the detail shows. */
function List({ label, className, ref, ...props }: ListProps) {
  const { detailShown, listRef } = useListDetail('List');
  const stacked = useSplitPane()?.stacked ?? false;
  return (
    <SplitPane.Pane
      {...props}
      ref={(node) => {
        listRef.current = node;
        setRef(ref, node);
      }}
      label={label}
      className={classNames('env-list-detail-list', className)}
      hidden={(stacked && detailShown) || props.hidden}
    />
  );
}

/**
 * The detail pane, after the handle that resizes the list. Stacked, it shows only while
 * detailShown, with a back button to the list at its start.
 */
function Detail({ label, className, children, ref, ...props }: DetailProps) {
  const { detailShown, onBack, backLabel, resizeLabel, listRef } = useListDetail('Detail');
  const stacked = useSplitPane()?.stacked ?? false;
  const back = useRef<HTMLButtonElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const previous = useRef({ detailShown, stacked });

  // The back button goes as the layout widens: focus on it moves to the detail first, rather than
  // falling to the page. The callback is stable, so this runs only when the button leaves.
  const backRef = useCallback((node: HTMLButtonElement | null) => {
    back.current = node;
    if (!node) return;
    return () => {
      back.current = null;
      const pane = detail.current;
      if (document.activeElement !== node || !pane) return;
      if (!pane.hasAttribute('tabindex')) pane.tabIndex = -1;
      pane.focus();
    };
  }, []);

  // Stacked, focus follows what shows: the back button once the detail opens, the list's current
  // row once it closes. Focus left inside a pane that the layout hides goes there too. Focus
  // elsewhere on the page stays where it is.
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { detailShown, stacked };
    if (!stacked) return;
    const active = document.activeElement;
    const root = detail.current?.parentElement;
    if (active && active !== document.body && !root?.contains(active)) return;
    if (detailShown && (!before.detailShown || listRef.current?.contains(active)))
      back.current?.focus();
    else if (!detailShown && (before.detailShown || detail.current?.contains(active)))
      focusCurrentRow(listRef.current);
  }, [detailShown, stacked, listRef]);

  return (
    <>
      <SplitPane.ResizeHandle label={resizeLabel} />
      <SplitPane.Pane
        {...props}
        ref={(node) => {
          detail.current = node;
          setRef(ref, node);
        }}
        label={label}
        className={classNames('env-list-detail-detail', className)}
        hidden={(stacked && !detailShown) || props.hidden}
      >
        {stacked && (
          <div className="env-list-detail-back">
            <Button ref={backRef} variant="text" startIcon={<ArrowBack />} onClick={onBack}>
              {backLabel}
            </Button>
          </div>
        )}
        {children}
      </SplitPane.Pane>
    </>
  );
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'ListDetail.Root');
const ListPart = /* @__PURE__ */ withDisplayName(List, 'ListDetail.List');
const DetailPart = /* @__PURE__ */ withDisplayName(Detail, 'ListDetail.Detail');
export { RootPart as Root, ListPart as List, DetailPart as Detail };
