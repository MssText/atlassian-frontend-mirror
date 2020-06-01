import React from 'react';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { findParentNode } from 'prosemirror-utils';
import { Node as PMNode } from 'prosemirror-model';
import { breakout } from '@atlaskit/adf-schema';
import { calcBreakoutWidth } from '@atlaskit/editor-common';
import { EditorPlugin, PMPluginFactoryParams } from '../../types';
import WithPluginState from '../../ui/WithPluginState';
import { pluginKey as widthPluginKey, WidthPluginState } from '../width';
import LayoutButton from './ui/LayoutButton';
import { isSupportedNodeForBreakout } from './utils/is-supported-node';
import { BreakoutCssClassName } from './constants';
import { EventDispatcher } from '../../';
import { pluginKey } from './plugin-key';
import { parsePx } from '../../utils/dom';

let debounce: number | null = null;

class BreakoutView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  view: EditorView;
  node: PMNode;
  eventDispatcher: EventDispatcher;

  constructor(
    node: PMNode,
    view: EditorView,
    eventDispatcher: EventDispatcher,
  ) {
    const contentDOM = document.createElement('div');
    contentDOM.className = BreakoutCssClassName.BREAKOUT_MARK_DOM;

    const dom = document.createElement('div');
    dom.className = BreakoutCssClassName.BREAKOUT_MARK;
    dom.setAttribute('data-layout', node.attrs.mode);
    dom.appendChild(contentDOM);

    this.dom = dom;
    this.node = node;
    this.view = view;
    this.contentDOM = contentDOM;
    this.eventDispatcher = eventDispatcher;

    eventDispatcher.on((widthPluginKey as any).key, this.updateWidth);
    this.updateWidth(widthPluginKey.getState(this.view.state));
    this.updateState();
  }

  private updateWidth = (widthState: WidthPluginState) => {
    const width = calcBreakoutWidth(this.node.attrs.mode, widthState.width);
    this.dom.style.width = width;

    const lineLength = widthState.lineLength;
    const widthPx = parsePx(width);

    if (lineLength && widthPx) {
      this.dom.style.transform = '';

      const marginLeftPx = -(widthPx - lineLength) / 2;
      this.dom.style.marginLeft = `${marginLeftPx}px`;
    } else {
      // fallback method
      // (lineLength is not normally undefined, but might be in e.g. SSR or initial render)
      //
      // this approach doesn't work well with position: fixed, so
      // it breaks things like sticky headers
      this.dom.style.marginLeft = '50%';
      this.dom.style.transform = 'translateX(-50%)';
    }
  };

  // update pluginState on each nodeView update in order to reposition layout button relatively the updated node
  private updateState = () => {
    if (debounce) {
      clearTimeout(debounce);
    }

    debounce = setTimeout(() => {
      const pluginState = pluginKey.getState(this.view.state);
      if (this.node !== pluginState.breakoutNode) {
        const nextPluginState = {
          ...pluginState,
          breakoutNode: this.node,
        };
        this.eventDispatcher.emit((pluginKey as any).key, nextPluginState);
      }
      debounce = null;
    });
  };

  destroy() {
    this.eventDispatcher.off((widthPluginKey as any).key, this.updateWidth);
  }
}

function createPlugin({ dispatch, eventDispatcher }: PMPluginFactoryParams) {
  return new Plugin({
    state: {
      init() {
        return {
          breakoutNode: null,
        };
      },
      apply(tr, pluginState) {
        const breakoutNode = findParentNode(isSupportedNodeForBreakout)(
          tr.selection,
        );

        const node = breakoutNode ? breakoutNode.node : null;
        if (node !== pluginState.breakoutNode) {
          const nextPluginState = {
            ...pluginState,
            breakoutNode: node,
          };
          dispatch(pluginKey, nextPluginState);
          return nextPluginState;
        }

        return pluginState;
      },
    },
    key: pluginKey,
    props: {
      nodeViews: {
        breakout: (node, view) => {
          return new BreakoutView(node, view, eventDispatcher);
        },
      },
    },
  });
}

interface BreakoutPluginOptions {
  allowBreakoutButton?: boolean;
}

const breakoutPlugin = (options?: BreakoutPluginOptions): EditorPlugin => ({
  name: 'breakout',

  pmPlugins() {
    return [
      {
        name: 'breakout',
        plugin: createPlugin,
      },
    ];
  },
  marks() {
    return [{ name: 'breakout', mark: breakout }];
  },

  contentComponent({
    editorView,
    popupsMountPoint,
    popupsBoundariesElement,
    popupsScrollableElement,
  }) {
    // This is a bit crappy, but should be resolved once we move to a static schema.
    if (options && !options.allowBreakoutButton) {
      return null;
    }

    return (
      <WithPluginState
        plugins={{
          pluginState: pluginKey,
        }}
        render={({ pluginState }) => (
          <LayoutButton
            editorView={editorView}
            mountPoint={popupsMountPoint}
            boundariesElement={popupsBoundariesElement}
            scrollableElement={popupsScrollableElement}
            node={pluginState.breakoutNode}
          />
        )}
      />
    );
  },
});

export default breakoutPlugin;
