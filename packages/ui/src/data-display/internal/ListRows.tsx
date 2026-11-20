import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { Column, Grid, Row } from '../../layout/Layout.js';
import { Slot } from '../../internal/layout/Slot.js';
import { SkeletonStatus } from '../../internal/skeleton/SkeletonScope.js';
import { Text } from '../../foundations/Text.js';
import {
  inSkeleton,
  inSkeletonList,
  given,
  skeletonAttributes,
  skeletonListAttributes,
} from '../../internal/skeleton/skeleton.js';
import { ListReorderHandle, ReorderableList } from './ReorderableList.js';
import { flag } from '../../internal/flag.js';
import { rowAttributes } from '../../internal/layout/primitiveAttributes.js';
import { RowControlProvider } from '../../internal/field/RowControl.js';
import type { ItemProps, RootProps } from '../List.js';
import { idRefs } from '../../internal/dom/idRefs.js';
import { givenLabelText } from '../../internal/text/labelText.js';

export interface ListIds {
  title?: string;
  label?: string;
  description?: string;
}

export function listIds(id: string): ListIds {
  return { title: `${id}-title`, label: `${id}-label`, description: `${id}-description` };
}

const showsReorderHandleProp = 'data-env-reorderable';

export function renderList(
  {
    title,
    headingLevel = 2,
    description,
    density = 'md',
    headerEnd,
    onReorder,
    handlePlacement = 'start',
    skeleton = false,
    className,
    children,
    ...ownProps
  }: RootProps,
  ids?: ListIds,
) {
  const titleId = ids?.title;
  const descriptionId = description != null ? ids?.description : undefined;
  const props =
    title == null
      ? ownProps
      : {
          ...ownProps,
          'aria-labelledby':
            ownProps['aria-labelledby'] ?? (ownProps['aria-label'] == null ? titleId : undefined),
          'aria-describedby': idRefs(descriptionId, ownProps['aria-describedby']),
        };
  const list = onReorder ? (
    <ReorderableList
      {...props}
      {...skeletonListAttributes(skeleton)}
      density={density}
      onReorder={onReorder}
      className={className}
    >
      {inSkeletonList(skeleton, markRowsToShowReorderHandle(children, handlePlacement))}
    </ReorderableList>
  ) : (
    <Grid
      render={
        <ul
          {...props}
          {...skeletonListAttributes(skeleton)}
          data-density={density}
          className={classNames('env-list', 'env-connected-rows', className)}
        />
      }
    >
      {inSkeletonList(skeleton, children)}
    </Grid>
  );
  const shown = skeleton ? (
    <>
      {list}
      <SkeletonStatus
        label={props['aria-label'] ?? (typeof title === 'string' ? title : undefined)}
      />
    </>
  ) : (
    list
  );
  if (title == null) return shown;
  const Heading = `h${headingLevel}` as const;
  const heading = (
    <Text variant="title" render={<Heading id={titleId} className="env-list-title" />}>
      {title}
    </Text>
  );
  return (
    <Column gap={3} className="env-list-section">
      <Column gap={1} className="env-list-header">
        {headerEnd != null ? (
          <Row wrap align="center" justify="between" gap={3}>
            {heading}
            <Slot className="env-list-header-end" layout="row" shrink="never">
              {headerEnd}
            </Slot>
          </Row>
        ) : (
          heading
        )}
        {description != null && (
          <Slot id={descriptionId} className="env-list-description">
            {description}
          </Slot>
        )}
      </Column>
      {shown}
    </Column>
  );
}

type HandlePlacement = NonNullable<RootProps['handlePlacement']>;

function markRowsToShowReorderHandle(children: ReactNode, placement: HandlePlacement): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    if (child.type === Fragment)
      return cloneElement(
        child,
        undefined,
        markRowsToShowReorderHandle(child.props.children, placement),
      );
    return cloneElement(child, { [showsReorderHandleProp]: placement } as object);
  });
}

type TargetProps = { 'data-row-target'?: unknown; 'aria-current'?: unknown; children?: ReactNode };

function markFirstRowTargetCurrent(node: ReactNode): [ReactNode, boolean] {
  let found = false;
  const visit = (each: ReactNode): ReactNode => {
    if (found || !isValidElement<TargetProps>(each)) return each;
    const element = each as ReactElement<TargetProps>;
    if (element.props['data-row-target'] != null && element.props['data-row-target'] !== false) {
      found = true;
      return element.props['aria-current'] == null
        ? cloneElement(element, { 'aria-current': 'true' })
        : element;
    }
    if (element.props.children == null) return element;
    const children = Children.map(element.props.children, visit);
    return found ? cloneElement(element, undefined, children) : element;
  };
  const marked = Children.map(node, visit);
  return found ? [marked, true] : [node, false];
}

const rowLayoutOnTheLiSavingARenderPerRow = rowAttributes({
  wrap: true,
  align: 'center',
  justify: 'between',
  gap: 3,
});

export function renderItem(props: ItemProps, ids?: ListIds) {
  const {
    label,
    description,
    end,
    control,
    interactive = false,
    current = false,
    start,
    textValue,
    skeleton = false,
    children,
    className,
    [showsReorderHandleProp]: handlePlacement,
    ...rest
  } = props as ItemProps & { [showsReorderHandleProp]?: HandlePlacement };
  const reorderable = handlePlacement !== undefined;
  const hasDescription = description != null || given(props, 'description');
  const labelId = control != null ? ids?.label : undefined;
  const descriptionId = control != null && hasDescription ? ids?.description : undefined;
  let targetMarked = false;
  const mark = (node: ReactNode) => {
    if (!current || targetMarked || node == null) return node;
    const [marked, found] = markFirstRowTargetCurrent(node);
    targetMarked = found;
    return marked;
  };
  const shownLabel = mark(label);
  const shownDescription = mark(description);
  const shownChildren = mark(children);
  const hasStart = start != null || reorderable;
  const text = givenLabelText(label, textValue);
  return (
    <li
      {...rowLayoutOnTheLiSavingARenderPerRow}
      aria-current={current && !targetMarked ? 'true' : undefined}
      {...rest}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-list-item', 'env-connected-row', className)}
      data-interactive={flag(interactive)}
      data-selected={flag(current)}
      data-start={flag(hasStart)}
    >
      {inSkeleton(
        skeleton,
        <>
          {handlePlacement === 'start' && <ListReorderHandle textValue={text} />}
          {start != null && (
            <Slot className="env-list-item-start" layout="row" shrink="never">
              {start}
            </Slot>
          )}
          <div className="env-list-item-content">
            <Slot id={labelId} className="env-list-item-label">
              {shownLabel ?? <Text render={<span />} variant="body-sm" />}
            </Slot>
            {hasDescription && (
              <div id={descriptionId} className="env-list-item-description">
                {shownDescription}
              </div>
            )}
            {shownChildren != null && <Slot className="env-list-item-extra">{shownChildren}</Slot>}
          </div>
          {end != null && (
            <Slot className="env-list-item-end" layout="row" shrink="never">
              {end}
            </Slot>
          )}
          {labelId != null && (
            <Slot className="env-list-item-control" layout="row" shrink="never">
              <RowControlProvider labelId={labelId} descriptionId={descriptionId}>
                {control}
              </RowControlProvider>
            </Slot>
          )}
          {handlePlacement === 'end' && <ListReorderHandle textValue={text} placement="end" />}
        </>,
      )}
    </li>
  );
}
