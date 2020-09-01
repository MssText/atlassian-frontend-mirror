import {
  NodeSelection,
  Transaction,
  TextSelection,
  Selection,
  AllSelection,
  EditorState,
} from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node as PmNode, ResolvedPos } from 'prosemirror-model';
import { CellSelection, selectedRect } from 'prosemirror-tables';
import {
  flatten,
  ContentNodeWithPos,
  NodeWithPos,
  findParentNode,
} from 'prosemirror-utils';

import {
  akEditorSelectedBgColor,
  akEditorSelectedBlanketColor,
  akEditorSelectedBlanketOpacity,
  akEditorSelectedBorder,
  akEditorSelectedBorderSize,
} from '@atlaskit/editor-common';

import { akEditorSelectedNodeClassName } from '../../styles';
import { isEmptyParagraph } from '../../utils/document';
import {
  AnalyticsEventPayload,
  ACTION,
  ACTION_SUBJECT,
  ACTION_SUBJECT_ID,
  EVENT_TYPE,
} from '../analytics';
import { isIgnored as isIgnoredByGapCursor } from '../gap-cursor/utils/is-ignored';

import { SelectionStyle, SelectionPluginState } from './types';

export const getDecorations = (tr: Transaction): DecorationSet => {
  if (tr.selection instanceof NodeSelection) {
    return DecorationSet.create(tr.doc, [
      Decoration.node(tr.selection.from, tr.selection.to, {
        class: akEditorSelectedNodeClassName,
      }),
    ]);
  }
  if (
    tr.selection instanceof TextSelection ||
    tr.selection instanceof AllSelection
  ) {
    const decorations = getTopLevelNodesFromSelection(tr.selection, tr.doc).map(
      ({ node, pos }) => {
        return Decoration.node(pos, pos + node.nodeSize, {
          class: akEditorSelectedNodeClassName,
        });
      },
    );
    return DecorationSet.create(tr.doc, decorations);
  }
  return DecorationSet.empty;
};

/**
 * Adds correct selection styling for a node
 * Pass in which selection style properties you want and it will return css string of necessary styles
 *
 * eg.
 *  .expand.ak-editor-selected-node {
 *    ${getSelectionStyles([SelectionStyle.BoxShadow, SelectionStyle.Blanket])}
 *  }
 *
 */
export const getSelectionStyles = (
  selectionStyles: Array<SelectionStyle>,
): string =>
  selectionStyles
    .map(selectionStyle => getSelectionStyle(selectionStyle))
    .concat(hideNativeBrowserTextSelectionStyles)
    .join('\n');

const hideNativeBrowserTextSelectionStyles = `
  ::selection,*::selection {
    background-color: transparent;
  }
  ::-moz-selection,*::-moz-selection {
    background-color: transparent;
  }
`;

const getSelectionStyle = (style: SelectionStyle): string => {
  switch (style) {
    case SelectionStyle.Border:
      return `border: ${akEditorSelectedBorderSize}px solid ${akEditorSelectedBorder};`;
    case SelectionStyle.BoxShadow:
      return `
        box-shadow: 0 0 0 ${akEditorSelectedBorderSize}px ${akEditorSelectedBorder};
        border-color: transparent;`;
    case SelectionStyle.Background:
      return `background-color: ${akEditorSelectedBgColor};`;
    case SelectionStyle.Blanket:
      return `
        position: relative;

        // Fixes ED-9263, where emoji or inline card in panel makes selection go outside the panel
        // in Safari. Looks like it's caused by user-select: all in the emoji element
        -webkit-user-select: text;

        ::after {
          position: absolute;
          content: '';
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          opacity: ${akEditorSelectedBlanketOpacity};
          pointer-events: none;
          background-color: ${akEditorSelectedBlanketColor}
        }`;
    default:
      return '';
  }
};

export function getNodeSelectionAnalyticsPayload(
  selection: Selection,
): AnalyticsEventPayload | undefined {
  if (selection instanceof NodeSelection) {
    return {
      action: ACTION.SELECTED,
      actionSubject: ACTION_SUBJECT.DOCUMENT,
      actionSubjectId: ACTION_SUBJECT_ID.NODE,
      eventType: EVENT_TYPE.TRACK,
      attributes: { node: selection.node.type.name },
    };
  }
}

export function getAllSelectionAnalyticsPayload(
  selection: Selection,
): AnalyticsEventPayload | undefined {
  if (selection instanceof AllSelection) {
    return {
      action: ACTION.SELECTED,
      actionSubject: ACTION_SUBJECT.DOCUMENT,
      actionSubjectId: ACTION_SUBJECT_ID.ALL,
      eventType: EVENT_TYPE.TRACK,
    };
  }
}

export function getCellSelectionAnalyticsPayload(
  state: EditorState,
): AnalyticsEventPayload | undefined {
  if (state.selection instanceof CellSelection) {
    const rect = selectedRect(state);
    const selectedCells = rect.map.cellsInRect(rect).length;
    const totalCells = rect.map.map.length;
    return {
      action: ACTION.SELECTED,
      actionSubject: ACTION_SUBJECT.DOCUMENT,
      actionSubjectId: ACTION_SUBJECT_ID.CELL,
      eventType: EVENT_TYPE.TRACK,
      attributes: {
        selectedCells,
        totalCells,
      },
    };
  }
}

/**
 * Use `getTopLevelNodesFromSelection` to collect and return
 * a list of only the outermost nodes of the given/passed `Selection`. This
 * function will ignore `paragraph` and `text` node types when collecting
 * top-level nodes. It will also ignore any top-level nodes that don't
 * completely sit within the given `Selection`.
 *
 * For example, using the following document:
 * ```
 * doc(p('{<}one'), blockquote(p('hello')), p(expand({ title: 'two' })(p('three'))), p('four{>}'))))
 * ```
 * we would expect `getTopLevelNodesFromSelection` to return:
 * ```
 * [blockquote(p('hello')), expand({ title: 'two' })(p('three')))]
 * ```
 */
export const getTopLevelNodesFromSelection = (
  selection: Selection,
  doc: PmNode,
) => {
  const nodes: { node: PmNode; pos: number }[] = [];
  if (selection.from !== selection.to) {
    const { from, to } = selection;
    doc.nodesBetween(from, to, (node, pos) => {
      const withinSelection = from <= pos && pos + node.nodeSize <= to;
      if (
        node &&
        node.type.name !== 'paragraph' &&
        !node.isText &&
        withinSelection
      ) {
        nodes.push({ node, pos });
        return false;
      }
      return true;
    });
  }
  return nodes;
};

export function getRangeSelectionAnalyticsPayload(
  selection: Selection,
  doc: PmNode,
): AnalyticsEventPayload | undefined {
  if (selection instanceof TextSelection && selection.from !== selection.to) {
    const { from, to, anchor, head } = selection;

    const nodes: string[] = [];
    doc.nodesBetween(from, to, (node, pos) => {
      // We want to send top-level nodes only, ie. the nodes that would have the selection styling
      // We allow text nodes that are not fully covered as they are a special case
      if (node.isText || (pos >= from && pos + node.nodeSize <= to)) {
        nodes.push(node.type.name);
        return false;
      }
    });

    return {
      action: ACTION.SELECTED,
      actionSubject: ACTION_SUBJECT.DOCUMENT,
      actionSubjectId: ACTION_SUBJECT_ID.RANGE,
      eventType: EVENT_TYPE.TRACK,
      attributes: {
        from: anchor,
        to: head,
        nodes,
      },
    };
  }
}

export function shouldRecalcDecorations(
  pluginState: SelectionPluginState,
  state: EditorState,
): boolean {
  const { selection: oldSelection, decorationSet } = pluginState;
  const { selection: newSelection } = state;

  // If selection is unchanged, no need to recalculate
  if (oldSelection.eq(newSelection)) {
    // We need this special case for NodeSelection, as Prosemirror still thinks the
    // selections are equal when the node has changed
    if (
      oldSelection instanceof NodeSelection &&
      newSelection instanceof NodeSelection
    ) {
      const oldDecorations = decorationSet.find();
      const newDecorations = getDecorations(state.tr).find();
      // There might not be old or new decorations if the node selection is for a text node
      // This wouldn't have happened intentionally, but we need to handle this case regardless
      if (oldDecorations.length > 0 && newDecorations.length > 0) {
        return !(oldDecorations[0] as Decoration & {
          eq: (other: Decoration) => boolean;
        }).eq(newDecorations[0]);
      }
      return !(oldDecorations.length === 0 && newDecorations.length === 0);
    }
    return false;
  }

  // There's no point updating decorations if going from one standard TextSelection to another
  if (
    oldSelection instanceof TextSelection &&
    newSelection instanceof TextSelection &&
    oldSelection.from === oldSelection.to &&
    newSelection.from === newSelection.to
  ) {
    return false;
  }

  return true;
}

export const isSelectableContainerNode = (node?: PmNode | null): boolean =>
  !!(node && !node.isAtom && NodeSelection.isSelectable(node));

export const isSelectableChildNode = (node?: PmNode | null): boolean =>
  !!(
    node &&
    (node.isText || isEmptyParagraph(node) || NodeSelection.isSelectable(node))
  );

/**
 * Finds closest parent node that is a selectable block container node
 * If it finds a parent that is not selectable but supports gap cursor, will
 * return undefined
 */
export const findSelectableContainerParent = (
  selection: Selection,
): ContentNodeWithPos | undefined => {
  let foundNodeThatSupportsGapCursor = false;
  const selectableNode = findParentNode(node => {
    const isSelectable = isSelectableContainerNode(node);
    if (!isSelectable && !isIgnoredByGapCursor(node)) {
      foundNodeThatSupportsGapCursor = true;
    }
    return isSelectable;
  })(selection);

  if (!foundNodeThatSupportsGapCursor) {
    return selectableNode;
  }
};

/**
 * Finds node before that is a selectable block container node, starting
 * from $pos.depth + 1 and working in
 * If it finds a node that is not selectable but supports gap cursor, will
 * return undefined
 */
export const findSelectableContainerBefore = (
  $pos: ResolvedPos,
  doc: PmNode,
): NodeWithPos | undefined => {
  // prosemirror just returns the same pos from Selection.findFrom when
  // parent.inlineContent is true, so we move position back one here
  // to counteract that
  if ($pos.parent.inlineContent && isSelectableContainerNode($pos.parent)) {
    $pos = doc.resolve($pos.start() - 1);
  }
  const selectionBefore = Selection.findFrom($pos, -1);
  if (selectionBefore) {
    const $selectionBefore = doc.resolve(selectionBefore.from);
    for (let i = $pos.depth + 1; i <= $selectionBefore.depth; i++) {
      const node = $selectionBefore.node(i);
      if (isSelectableContainerNode(node)) {
        return {
          node,
          pos: $selectionBefore.start(i) - 1,
        };
      }
      if (i > $pos.depth + 1 && !isIgnoredByGapCursor(node)) {
        return;
      }
    }
  }
};

/**
 * Finds node after that is a selectable block container node, starting
 * from $pos.depth + 1 and working in
 * If it finds a node that is not selectable but supports gap cursor, will
 * return undefined
 */
export const findSelectableContainerAfter = (
  $pos: ResolvedPos,
  doc: PmNode,
): NodeWithPos | undefined => {
  const selectionAfter = Selection.findFrom($pos, 1);
  if (selectionAfter) {
    const $selectionAfter = doc.resolve(selectionAfter.from);
    for (let i = $pos.depth + 1; i <= $selectionAfter.depth; i++) {
      const node = $selectionAfter.node(i);
      if (isSelectableContainerNode(node)) {
        return {
          node,
          pos: $selectionAfter.start(i) - 1,
        };
      }
      if (i > $pos.depth + 1 && !isIgnoredByGapCursor(node)) {
        return;
      }
    }
  }
};

/**
 * Finds first child node that is a selectable block container node OR that
 * supports gap cursor
 */
export const findFirstChildNodeToSelect = (
  parent: PmNode,
): NodeWithPos | undefined =>
  flatten(parent).find(
    child =>
      isSelectableChildNode(child.node) || !isIgnoredByGapCursor(child.node),
  );

/**
 * Finds last child node that is a selectable block container node OR that
 * supports gap cursor
 */
export const findLastChildNodeToSelect = (
  parent: PmNode,
): NodeWithPos | undefined => {
  let child: NodeWithPos | undefined;
  parent.descendants((node, pos) => {
    if (isSelectableChildNode(node) || !isIgnoredByGapCursor(node)) {
      child = { node, pos };
      return false;
    }
  });
  if (child) {
    return child;
  }
};

export const isSelectionAtStartOfParentNode = (
  $pos: ResolvedPos,
  selection: Selection,
): boolean => {
  const parentNode = findSelectableContainerParent(selection);
  if (!parentNode || parentNode.depth === 0) {
    return false;
  }

  for (let i = $pos.depth + 1; i > 0; i--) {
    const node = $pos.node(i);
    if (node && node.eq(parentNode.node)) {
      break;
    }

    if (i > 1 && $pos.before(i) !== $pos.before(i - 1) + 1) {
      return false;
    }
  }

  return true;
};

export const isSelectionAtEndOfParentNode = (
  $pos: ResolvedPos,
  selection: Selection,
): boolean => {
  const parentNode = findSelectableContainerParent(selection);
  if (!parentNode) {
    return false;
  }

  for (let i = $pos.depth + 1; i > 0; i--) {
    const node = $pos.node(i);
    if (node && node.eq(parentNode.node)) {
      break;
    }

    if (i > 1 && $pos.after(i) !== $pos.after(i - 1) - 1) {
      return false;
    }
  }

  return true;
};
