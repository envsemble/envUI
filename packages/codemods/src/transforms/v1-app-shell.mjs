// v1-app-shell: rewrites envUI 0.x's monolithic AppShell and AppShellSkeleton into 1.0's frame
// parts, as the rename map's `structure` section marks them (`"transform": "v1-app-shell"`). The
// rewrite is one-to-many: props become child elements whose place depends on `topbar`.
//
// <AppShell brand context title actions navigation navigationLabel sidebarContent …>{page}</AppShell>
// becomes, for the split topbar (the default):
//
//   <AppShell.Root …>
//     <AppShell.SkipLinks />
//     <Sidebar.Root label={navigationLabel} resizable resizeLabel minWidth maxWidth>
//       <Sidebar.Header><SidebarTrigger mark={brand} expandLabel collapseLabel />{context}</Sidebar.Header>
//       <Sidebar.Content><NavList.Root>{navigation}</NavList.Root></Sidebar.Content>
//       <Sidebar.Content fill>{sidebarContent}</Sidebar.Content>
//     </Sidebar.Root>
//     <AppShell.Header end={actions}>{title}</AppShell.Header>
//     <AppShell.Main>{page}</AppShell.Main>
//   </AppShell.Root>
//
// and for topbar="full" the trigger and the context go to AppShell.Header's `start`. On the root:
// topbar is headerSpan, storageKey is persist (reported once: the stored format changes),
// defaultCollapsed, collapsed and onCollapsedChange are negated into defaultSidebarOpen,
// sidebarOpen and onSidebarOpenChange, and sidebarWidth and onSidebarWidthChange stay, reported for
// their unit. sidebarMinWidth and sidebarMaxWidth, in pixels, become the sidebar's minWidth and
// maxWidth in rem: a literal is divided by 16, an expression gets `/ 16` and a report.
//
// AppShellSkeleton becomes the same parts inside a LoadingState, with NavList.Skeleton in
// Sidebar.Content, `aria-busy` on the root and its `label` on the LoadingState.
//
// `const { closeNarrowSidebar } = useAppShell()` becomes `const { dismiss: closeNarrowSidebar } =
// useSidebar()`; other uses of closeNarrowSidebar are reported.
//
// Elements are matched by their import from @envsemble/envui, under an alias or through a namespace
// import. `<AppShell>` itself, which 1.0 can't render (AppShell is a namespace of parts), is 0.x's.
// `<AppShell.Root>` is 1.0's, or a 0.x AppShell that v1-names renamed: it is rewritten only with a
// prop that only 0.x took, such as navigation (not title, which 1.0's root takes as a div's);
// without one it is left as it is, and reported with `reports.ambiguous` where no frame part is
// inside it, as 0.x's `<AppShell loading>{page}</AppShell>` after v1-names. An element that spreads
// props is reported with the entry's `report`.
//
// A 0.x AppShell with nothing for the sidebar (no navigation, sidebarContent, brand, context or
// sidebar props) gets no Sidebar.Root and no trigger, rather than an empty Navigation sidebar.
import { loadMap } from '../map.mjs';
import { componentResolver, envuiImports, jsxPath, literalKey } from '../elements.mjs';
import {
  createReporter,
  indentsWithTabs,
  keepByteOrderMark,
  parserFor,
  printOptions,
} from '../shared.mjs';

export const parser = 'tsx';

/** Props only 0.x AppShell takes; an element with one of them is in its 0.x form. */
const legacyProps = [
  'brand',
  'context',
  'title',
  'actions',
  'navigation',
  'navigationLabel',
  'topbar',
  'storageKey',
  'defaultCollapsed',
  'collapsed',
  'onCollapsedChange',
  'expandLabel',
  'collapseLabel',
  'sidebarContent',
  'resizable',
  'resizeLabel',
  'sidebarMinWidth',
  'sidebarMaxWidth',
];

/** 0.x's props that 1.0's AppShell.Root takes too, so they don't tell the forms apart. */
const sharedLegacyProps = ['title'];

/**
 * The output of a file indented with tabs, its new lines indented with tabs too: recast reprints a
 * list it adds to, such as an import's, with four spaces for each level. Lines kept from the source
 * stay as they were, so a template literal's spaces stay.
 */
function withTabs(source, output) {
  if (!indentsWithTabs(source)) return output;
  const kept = new Set(source.split(/\r?\n/));
  return output
    .split(/(\r?\n)/)
    .map((line) => {
      if (kept.has(line)) return line;
      return line.replace(/^[\t ]+/, (indent) => {
        const width = [...indent].reduce((sum, character) => sum + (character === '\t' ? 4 : 1), 0);
        return '\t'.repeat(Math.floor(width / 4)) + ' '.repeat(width % 4);
      });
    })
    .join('');
}

/** The JSX name for a dotted name, such as `Sidebar.Root`. */
function jsxName(j, name) {
  const [first, ...rest] = name.split('.');
  return rest.reduce(
    (object, part) => j.jsxMemberExpression(object, j.jsxIdentifier(part)),
    j.jsxIdentifier(first),
  );
}

export default function transform(file, api, options = {}) {
  const { entries } = loadMap(options.map);
  if (![...entries.keys()].some((entry) => file.source.includes(entry))) return undefined;

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);
  const imports = envuiImports(j, root, entries);
  if (imports.components.size === 0 && imports.namespaceImports.size === 0) return undefined;
  const componentOf = componentResolver(imports);

  /** Names bound at the top of the module, which a new import may not take. */
  const topNames = new Set();
  root
    .find(j.Program)
    .forEach((path) => Object.keys(path.scope.getBindings()).forEach((name) => topNames.add(name)));

  /** The local name under which the file imports `name` from `entry`, adding the import. */
  const imported = new Map();
  function localFor(entry, name) {
    const key = `${entry.name} ${name}`;
    if (imported.has(key)) return imported.get(key);
    for (const [local, each] of imports.components)
      if (each.entry === entry && each.imported === name) {
        imported.set(key, local);
        return local;
      }
    let local = name;
    for (let index = 2; topNames.has(local); index += 1)
      local = index === 2 ? `Env${name}` : `Env${name}${index}`;
    topNames.add(local);
    const declaration = root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.value === entry.name &&
          path.node.importKind !== 'type' &&
          (path.node.specifiers ?? []).every((specifier) => specifier.type === 'ImportSpecifier'),
      )
      .paths()[0];
    const specifier =
      local === name
        ? j.importSpecifier(j.identifier(name))
        : j.importSpecifier(j.identifier(name), j.identifier(local));
    if (declaration) declaration.node.specifiers.push(specifier);
    else {
      const last = root.find(j.ImportDeclaration).paths().at(-1);
      last.insertAfter(j.importDeclaration([specifier], j.stringLiteral(entry.name)));
    }
    imports.components.set(local, { entry, imported: name });
    imported.set(key, local);
    return local;
  }

  /** The JSX name of a part, such as `Sidebar.Root`, through the file's import or namespace. */
  const partName = (component, name) => {
    if (component.namespace) return `${component.namespace}.${name}`;
    const [first, ...parts] = name.split('.');
    return [localFor(component.entry, first), ...parts].join('.');
  };

  const element = (name, attributes = [], children = []) =>
    j.jsxElement(
      j.jsxOpeningElement(jsxName(j, name), attributes, children.length === 0),
      children.length === 0 ? null : j.jsxClosingElement(jsxName(j, name)),
      children.length === 0
        ? []
        : children.flatMap((child) => [j.jsxText('\n'), child]).concat(j.jsxText('\n')),
    );

  const attributeIndex = (attributes, name) =>
    attributes.findIndex((node) => node.type === 'JSXAttribute' && node.name.name === name);
  /** Takes an attribute off the list and returns it, or undefined where it isn't set. */
  function take(attributes, name) {
    const index = attributeIndex(attributes, name);
    return index === -1 ? undefined : attributes.splice(index, 1)[0];
  }
  /** An attribute's value as an expression: true for a bare attribute. */
  function expressionOf(attribute) {
    const { value } = attribute;
    if (value == null) return j.booleanLiteral(true);
    if (value.type === 'JSXExpressionContainer') return value.expression;
    return value;
  }
  /** An attribute's value as children: an element as it is, anything else in braces. */
  function childrenOf(attribute) {
    const { value } = attribute;
    if (value == null) return [];
    if (value.type === 'StringLiteral' || value.type === 'Literal')
      return value.value.trim() === '' ? [] : [j.jsxText(value.value)];
    const expression = value.type === 'JSXExpressionContainer' ? value.expression : value;
    if (expression.type === 'JSXEmptyExpression') return [];
    if (expression.type === 'JSXFragment') return expression.children.filter(meaningful);
    if (expression.type === 'JSXElement') return [expression];
    return [j.jsxExpressionContainer(expression)];
  }
  const meaningful = (child) => !(child.type === 'JSXText' && child.value.trim() === '');
  /** A child that renders something: not blank text, nor {null} or {false}. */
  const meaningfulChild = (child) =>
    meaningful(child) &&
    !(
      child.type === 'JSXExpressionContainer' &&
      (child.expression.type === 'NullLiteral' ||
        (child.expression.type === 'BooleanLiteral' && !child.expression.value) ||
        (child.expression.type === 'Identifier' && child.expression.name === 'undefined'))
    );
  const renamed = (attribute, name) => {
    attribute.name = j.jsxIdentifier(name);
    return attribute;
  };
  /** `!value`, folding a literal and wrapping anything but a name or a call in parentheses. */
  function negated(attribute) {
    const key = literalKey(attribute.value);
    if (key === 'true' || attribute.value == null) return j.booleanLiteral(false);
    if (key === 'false') return j.booleanLiteral(true);
    const expression = expressionOf(attribute);
    return j.unaryExpression('!', expression);
  }
  const expressionAttribute = (name, expression) =>
    j.jsxAttribute(
      j.jsxIdentifier(name),
      expression.type === 'BooleanLiteral' && expression.value === true
        ? null
        : j.jsxExpressionContainer(expression),
    );
  /** A width in pixels as rem: a literal divided by 16, an expression with `/ 16`. */
  function remAttribute(name, attribute, report) {
    const key = literalKey(attribute.value);
    const number = key === undefined ? NaN : Number(key);
    if (Number.isFinite(number))
      return expressionAttribute(name, j.numericLiteral(Math.round((number / 16) * 1000) / 1000));
    report();
    return expressionAttribute(
      name,
      j.binaryExpression('/', expressionOf(attribute), j.numericLiteral(16)),
    );
  }

  /** The dotted name of a JSX element, such as `NavList.Item`, or undefined for a fragment. */
  function dottedName(name) {
    if (name.type === 'JSXIdentifier') return name.name;
    if (name.type === 'JSXMemberExpression') {
      const object = dottedName(name.object);
      return object && `${object}.${name.property.name}`;
    }
    return undefined;
  }
  /** The component and part an element names through the file's imports, such as NavList and Item. */
  function partOf(node) {
    if (node.type !== 'JSXElement') return undefined;
    const parts = dottedName(node.openingElement.name)?.split('.') ?? [];
    const imported = imports.components.get(parts[0]);
    if (imported) return { component: imported.imported, part: parts[1] };
    if (imports.namespaceImports.has(parts[0])) return { component: parts[1], part: parts[2] };
    return undefined;
  }
  /** A NavList item, group or section heading, which NavList.Root holds. */
  const isNavListItem = (node) => {
    const named = partOf(node);
    return named?.component === 'NavList' && named.part !== undefined && named.part !== 'Root';
  };
  /** Whether a 1.0 frame part is inside the element: AppShell's parts, a Sidebar or a trigger. */
  const hasFrameParts = (path) =>
    j(path)
      .find(j.JSXElement)
      .some((each) => {
        if (each.node === path.node) return false;
        const named = partOf(each.node);
        if (!named) return false;
        if (named.component === 'AppShell') return named.part !== undefined;
        return ['Sidebar', 'SidebarTrigger'].includes(named.component);
      });

  /** Rewrites one AppShell or AppShellSkeleton element; returns whether it changed. */
  function rewrite(path, component, rule, skeleton, bare) {
    const { node } = path;
    const attributes = node.openingElement.attributes;
    const where = component.name;
    const reports = rule.reports ?? {};
    if (attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute')) {
      reporter.warn(node, `${where}: ${rule.report}`);
      return false;
    }
    // AppShell.Root without a prop only 0.x took is 1.0's, or a 0.x AppShell renamed by v1-names:
    // it is left alone, and reported where nothing inside it says it is 1.0's.
    if (
      !skeleton &&
      !bare &&
      !legacyProps.some(
        (prop) => !sharedLegacyProps.includes(prop) && attributeIndex(attributes, prop) !== -1,
      )
    ) {
      if (!hasFrameParts(path))
        reporter.warn(node, `${where}: ${reports.ambiguous ?? rule.report}`);
      return false;
    }

    // Where the mark and the context go follows topbar.
    const topbar = take(attributes, 'topbar');
    const topbarKey = topbar && literalKey(topbar.value);
    const full = topbarKey === 'full';
    const rootAttributes = [];
    if (topbar) {
      if (topbarKey === undefined) {
        reporter.warn(topbar, `${where}: ${reports.topbar ?? rule.report}`);
        // topbar is split or full; headerSpan is main or full.
        rootAttributes.push(
          expressionAttribute(
            'headerSpan',
            j.conditionalExpression(
              j.binaryExpression('===', expressionOf(topbar), j.stringLiteral('full')),
              j.stringLiteral('full'),
              j.stringLiteral('main'),
            ),
          ),
        );
      } else if (full)
        rootAttributes.push(j.jsxAttribute(j.jsxIdentifier('headerSpan'), j.stringLiteral('full')));
    }

    const brand = take(attributes, 'brand');
    const context = take(attributes, 'context');
    const title = take(attributes, 'title');
    const actions = take(attributes, 'actions');
    const navigation = take(attributes, 'navigation');
    const navigationLabel = take(attributes, 'navigationLabel');
    const sidebarContent = take(attributes, 'sidebarContent');
    const expandLabel = take(attributes, 'expandLabel');
    const collapseLabel = take(attributes, 'collapseLabel');
    const sidebarAttributes = [];
    for (const name of ['resizable', 'resizeLabel']) {
      const attribute = take(attributes, name);
      if (attribute) sidebarAttributes.push(attribute);
    }
    for (const [from, to] of [
      ['sidebarMinWidth', 'minWidth'],
      ['sidebarMaxWidth', 'maxWidth'],
    ]) {
      const attribute = take(attributes, from);
      if (attribute)
        sidebarAttributes.push(
          remAttribute(to, attribute, () =>
            reporter.warn(attribute, `${where}: ${reports.minWidth ?? rule.report}`),
          ),
        );
    }

    // The root's own props.
    const storageKey = take(attributes, 'storageKey');
    if (storageKey) {
      rootAttributes.push(renamed(storageKey, 'persist'));
      if (!skeleton && reports.storageKey)
        reporter.warn(storageKey, `${where}: ${reports.storageKey}`);
    }
    const defaultCollapsed = take(attributes, 'defaultCollapsed');
    if (defaultCollapsed) {
      const value = negated(defaultCollapsed);
      if (!(value.type === 'BooleanLiteral' && value.value === true))
        rootAttributes.push(expressionAttribute('defaultSidebarOpen', value));
    }
    const collapsed = take(attributes, 'collapsed');
    if (collapsed)
      rootAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('sidebarOpen'),
          j.jsxExpressionContainer(negated(collapsed)),
        ),
      );
    const onCollapsedChange = take(attributes, 'onCollapsedChange');
    if (onCollapsedChange)
      rootAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('onSidebarOpenChange'),
          j.jsxExpressionContainer(
            j.arrowFunctionExpression(
              [j.identifier('open')],
              j.callExpression(expressionOf(onCollapsedChange), [
                j.unaryExpression('!', j.identifier('open')),
              ]),
            ),
          ),
        ),
      );
    for (const name of ['sidebarWidth', 'onSidebarWidthChange']) {
      const attribute = attributes[attributeIndex(attributes, name)];
      if (attribute && reports.sidebarWidth)
        reporter.warn(attribute, `${where}: ${reports.sidebarWidth}`);
    }
    let label;
    let items;
    if (skeleton) {
      label = take(attributes, 'label');
      items = take(attributes, 'navigationItems');
    }

    // A shell with nothing for the sidebar gets none, nor a trigger to toggle it.
    const hasSidebar =
      skeleton ||
      [
        navigation,
        navigationLabel,
        sidebarContent,
        brand,
        context,
        expandLabel,
        collapseLabel,
      ].some(Boolean) ||
      sidebarAttributes.length > 0;

    // The trigger, with the mark, and the context beside it.
    const triggerAttributes = [];
    if (brand) triggerAttributes.push(renamed(brand, 'mark'));
    if (expandLabel) triggerAttributes.push(expandLabel);
    if (collapseLabel) triggerAttributes.push(collapseLabel);
    const trigger = hasSidebar
      ? element(partName(component, 'SidebarTrigger'), triggerAttributes)
      : null;
    const beside = context ? childrenOf(context) : [];

    // The sidebar.
    const sidebarChildren = [];
    if (!full && hasSidebar)
      sidebarChildren.push(
        element(partName(component, 'Sidebar.Header'), [], [trigger, ...beside]),
      );
    const navigationChildren = navigation ? childrenOf(navigation) : [];
    // NavList items go into a NavList.Root; anything else, such as a NavList.Root or a Tree of the
    // application's own, stays as it is.
    const listChildren = skeleton
      ? [element(partName(component, 'NavList.Skeleton'), items ? [renamed(items, 'items')] : [])]
      : !navigationChildren.some(meaningfulChild)
        ? []
        : navigationChildren.filter(meaningfulChild).every(isNavListItem)
          ? [element(partName(component, 'NavList.Root'), [], navigationChildren)]
          : navigationChildren;
    if (listChildren.length)
      sidebarChildren.push(element(partName(component, 'Sidebar.Content'), [], listChildren));
    if (sidebarContent)
      sidebarChildren.push(
        element(
          partName(component, 'Sidebar.Content'),
          [j.jsxAttribute(j.jsxIdentifier('fill'))],
          childrenOf(sidebarContent),
        ),
      );
    let sidebar;
    if (hasSidebar) {
      let sidebarLabel = navigationLabel && renamed(navigationLabel, 'label');
      if (!sidebarLabel) {
        sidebarLabel = j.jsxAttribute(j.jsxIdentifier('label'), j.stringLiteral('Navigation'));
        reporter.warn(node, `${where}: ${reports.label ?? rule.report}`);
      }
      sidebar = element(
        partName(component, 'Sidebar.Root'),
        [sidebarLabel, ...sidebarAttributes],
        sidebarChildren,
      );
    }

    // The header.
    const headerAttributes = [];
    if (full && hasSidebar)
      headerAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('start'),
          j.jsxExpressionContainer(
            beside.length
              ? j.jsxFragment(
                  j.jsxOpeningFragment(),
                  j.jsxClosingFragment(),
                  [trigger, ...beside]
                    .flatMap((child) => [j.jsxText('\n'), child])
                    .concat(j.jsxText('\n')),
                )
              : trigger,
          ),
        ),
      );
    if (actions) headerAttributes.push(renamed(actions, 'end'));
    const header = element(
      partName(component, 'AppShell.Header'),
      headerAttributes,
      title ? childrenOf(title) : [],
    );

    // The page.
    const page = (node.children ?? []).filter(meaningful);
    const main = element(partName(component, 'AppShell.Main'), [], page);
    const frameChildren = [
      ...(skeleton ? [] : [element(partName(component, 'AppShell.SkipLinks'))]),
      ...(sidebar ? [sidebar] : []),
      header,
      main,
    ];
    if (skeleton) rootAttributes.push(j.jsxAttribute(j.jsxIdentifier('aria-busy')));
    const frame = element(
      partName(component, 'AppShell.Root'),
      [...attributes, ...rootAttributes],
      frameChildren,
    );
    if (!skeleton) {
      frame.extra = node.extra;
      path.replace(frame);
      return true;
    }
    const loading = element(partName(component, 'LoadingState'), label ? [label] : [], [frame]);
    loading.extra = node.extra;
    path.replace(loading);
    return true;
  }

  let changed = false;
  // Outer elements are rewritten from the inside out, so a page inside keeps its own rewrites.
  const elements = root.find(j.JSXElement).paths().reverse();
  for (const path of elements) {
    const component = componentOf(path.get('openingElement'));
    const rule = component && component.entry.structure.get(component.name);
    if (!rule || rule.transform !== 'v1-app-shell') continue;
    const skeleton = component.name === 'AppShellSkeleton';
    // `<AppShell>` or `<ui.AppShell>` itself, without a part: 0.x's element.
    const names = jsxPath(path.node.openingElement.name);
    const bare = names.length === (component.namespace ? 2 : 1);
    if (rewrite(path, component, rule, skeleton, bare)) changed = true;
  }

  // const { closeNarrowSidebar } = useAppShell() becomes useSidebar().dismiss.
  const hookLocals = [...imports.components]
    .filter(([, each]) => each.imported === 'useAppShell')
    .map(([local, each]) => [local, each.entry]);
  for (const [local, entry] of hookLocals) {
    root
      .find(j.VariableDeclarator, {
        init: { type: 'CallExpression', callee: { type: 'Identifier', name: local } },
      })
      .forEach((path) => {
        const { id } = path.node;
        if (id.type !== 'ObjectPattern') return;
        const index = id.properties.findIndex(
          (property) =>
            (property.type === 'ObjectProperty' || property.type === 'Property') &&
            property.key.type === 'Identifier' &&
            property.key.name === 'closeNarrowSidebar',
        );
        if (index === -1) return;
        const [property] = id.properties.splice(index, 1);
        const value =
          property.value.type === 'Identifier' ? property.value.name : 'closeNarrowSidebar';
        const dismiss = j.objectProperty(j.identifier('dismiss'), j.identifier(value));
        const declarator = j.variableDeclarator(
          j.objectPattern([dismiss]),
          j.callExpression(j.identifier(localFor(entry, 'useSidebar')), []),
        );
        if (id.properties.length === 0) path.replace(declarator);
        // The rest stays with useAppShell; useSidebar's declaration follows it.
        else j(path.parent).insertAfter(j.variableDeclaration(path.parent.node.kind, [declarator]));
        changed = true;
      });
    // Any other use of closeNarrowSidebar.
    root
      .find(j.MemberExpression, { property: { type: 'Identifier', name: 'closeNarrowSidebar' } })
      .forEach((path) =>
        reporter.warn(
          path.node,
          'closeNarrowSidebar is useSidebar().dismiss() in 1.0, which closes the drawer, a peek or a held rail.',
        ),
      );
  }

  if (changed) {
    // An import that nothing uses any more, such as AppShellSkeleton's or useAppShell's, goes.
    for (const [local, each] of imports.components) {
      if (!each.declaration) continue;
      const uses =
        root.find(j.JSXIdentifier, { name: local }).size() +
        root
          .find(j.Identifier, { name: local })
          .filter((path) => path.parent.node.type !== 'ImportSpecifier')
          .size();
      if (uses > 0) continue;
      const declaration = each.declaration.node;
      declaration.specifiers = declaration.specifiers.filter(
        (specifier) => specifier.local?.name !== local,
      );
      if (declaration.specifiers.length === 0) j(each.declaration).remove();
    }
  }

  reporter.flush();
  if (!changed) return undefined;
  const output = root.toSource(printOptions(file.source, 'double'));
  return keepByteOrderMark(file.source, withTabs(file.source, output));
}
