/** @jsx jsx */
import { useState, useCallback, useEffect, createRef } from 'react';
import { css, jsx } from '@emotion/react';
import { Component } from 'react';
import { gridSize } from '@atlaskit/theme/constants';
import { B400 } from '@atlaskit/theme/colors';
import { ButtonItem, ButtonItemProps } from '@atlaskit/menu';
import EditorDoneIcon from '@atlaskit/icon/glyph/editor/done';
import Tooltip from '@atlaskit/tooltip';
import { DropdownOptionT } from './types';
import { injectIntl, WrappedComponentProps, IntlShape } from 'react-intl-next';
import messages from './messages';
import { token } from '@atlaskit/tokens';
import { EditorView } from 'prosemirror-view';

export const menuItemDimensions = {
  width: 175,
  height: 32,
};

const spacer = css`
  display: flex;
  flex: 1;
  padding: 8px;
`;

const menuContainer = css`
  min-width: ${menuItemDimensions.width}px;

  // temporary solution to retain spacing defined by @atlaskit/Item
  & button {
    min-height: ${gridSize() * 4}px;
    padding: 8px 8px 7px;

    & > [data-item-elem-before] {
      margin-right: ${gridSize() / 2}px;
    }
  }
`;

const label = css`
  display: inline-block;
  width: 100%;
`;

export const itemSpacing = gridSize() / 2;
export interface Props {
  hide: Function;
  dispatchCommand: Function;
  items: Array<DropdownOptionT<Function>>;
  showSelected?: boolean;
  editorView?: EditorView;
}

// Extend the ButtonItem component type to allow mouse events to be accepted from the Typescript check
export interface DropdownButtonItemProps extends ButtonItemProps {
  onMouseEnter?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseOver?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseLeave?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseOut?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onFocus?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onBlur?: (event: React.MouseEvent | React.KeyboardEvent) => void;
}
const DropdownButtonItem: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    DropdownButtonItemProps & React.RefAttributes<HTMLElement>
  >
> = ButtonItem as any;

const DropdownMenuItem = ({
  item,
  hide,
  dispatchCommand,
  editorView,
  iconBefore,
}: {
  item: DropdownOptionT<Function>;
  hide: Function;
  dispatchCommand: Function;
  editorView?: EditorView;
  iconBefore: React.ReactNode;
}) => {
  const [tooltipContent, setTooltipContent] = useState<string>(
    item.tooltip || '',
  );

  const handleItemMouseOut = useCallback(() => {
    setTooltipContent('');
    if (item.onMouseOut) {
      dispatchCommand(item.onMouseOut);
    }
  }, [item.onMouseOut, dispatchCommand]);

  const handleItemMouseDown = useCallback(
    (e) => {
      e.preventDefault(); // ED-16204 - This is needed for safari to get handleItemClick() to work
      if (item.onMouseDown) {
        dispatchCommand(item.onMouseDown);
      }
    },
    [item.onMouseDown, dispatchCommand],
  );

  const handleItemMouseOver = useCallback(() => {
    setTooltipContent(item.tooltip || '');
    if (item.onMouseOver) {
      dispatchCommand(item.onMouseOver);
    }
  }, [item.tooltip, item.onMouseOver, dispatchCommand]);

  const handleItemMouseEnter = useCallback(
    (e) => {
      if (item.onMouseEnter) {
        e.preventDefault();
        dispatchCommand(item.onMouseEnter);
      }
    },
    [item.onMouseEnter, dispatchCommand],
  );

  const handleItemMouseLeave = useCallback(
    (e) => {
      if (item.onMouseLeave) {
        e.preventDefault();
        dispatchCommand(item.onMouseLeave);
      }
    },
    [item.onMouseLeave, dispatchCommand],
  );

  const handleItemOnFocus = useCallback(
    (e) => {
      if (item.onFocus) {
        e.preventDefault();
        dispatchCommand(item.onFocus);
      }
    },
    [item.onFocus, dispatchCommand],
  );

  const handleItemOnBlur = useCallback(
    (e) => {
      if (item.onBlur) {
        e.preventDefault();
        dispatchCommand(item.onBlur);
      }
    },
    [item.onBlur, dispatchCommand],
  );

  const handleItemClick = useCallback(() => {
    /**
     * The order of dispatching the event and hide() is important, because
     * the ClickAreaBlock will be relying on the element to calculate the
     * click coordinate.
     * For more details, please visit the comment in this PR https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/5328/edm-1321-set-selection-near-smart-link?link_source=email#chg-packages/editor/editor-core/src/plugins/floating-toolbar/ui/DropdownMenu.tsx
     */
    dispatchCommand(item.onClick);
    hide();
    if (!editorView?.hasFocus()) {
      editorView?.focus();
    }
  }, [dispatchCommand, item.onClick, hide, editorView]);

  /* ED-16704 - Native mouse event handler to overcome firefox issue on disabled <button> - https://github.com/whatwg/html/issues/5886 */
  const labelRef = createRef<HTMLDivElement>();
  const handleTitleWrapperMouseEvent = useCallback(
    (e) => {
      if (item.disabled) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
    [item.disabled],
  );
  useEffect(() => {
    const labelRefCurrent = labelRef.current;
    labelRefCurrent?.addEventListener('click', handleTitleWrapperMouseEvent);
    labelRefCurrent?.addEventListener(
      'mousedown',
      handleTitleWrapperMouseEvent,
    );
    return () => {
      labelRefCurrent?.removeEventListener(
        'click',
        handleTitleWrapperMouseEvent,
      );
      labelRefCurrent?.removeEventListener(
        'mousedown',
        handleTitleWrapperMouseEvent,
      );
    };
  });

  const itemContent = (
    <DropdownButtonItem
      iconBefore={iconBefore}
      iconAfter={item.elemAfter}
      onClick={handleItemClick}
      data-testid={item.testId}
      isDisabled={item.disabled}
      onMouseDown={handleItemMouseDown}
      onMouseOver={handleItemMouseOver}
      onMouseEnter={handleItemMouseEnter}
      onMouseLeave={handleItemMouseLeave}
      onMouseOut={handleItemMouseOut}
      onFocus={handleItemOnFocus}
      onBlur={handleItemOnBlur}
    >
      <span ref={labelRef} css={label}>
        {item.title}
      </span>
    </DropdownButtonItem>
  );

  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{itemContent}</Tooltip>;
  }

  return itemContent;
};

class Dropdown extends Component<Props & WrappedComponentProps> {
  render() {
    const { hide, dispatchCommand, items, intl, editorView } = this.props;
    return (
      <div css={menuContainer}>
        {items
          .filter((item) => !item.hidden)
          .map((item, idx) => (
            <DropdownMenuItem
              key={idx}
              item={item}
              hide={hide}
              dispatchCommand={dispatchCommand}
              editorView={editorView}
              iconBefore={this.renderSelected(item, intl)}
            />
          ))}
      </div>
    );
  }

  private renderSelected(item: DropdownOptionT<any>, intl: IntlShape) {
    const { showSelected = true } = this.props;
    const { selected } = item;

    if (showSelected && selected) {
      return (
        <EditorDoneIcon
          primaryColor={token('color.icon.selected', B400)}
          size="small"
          label={intl.formatMessage(messages.confirmModalOK)}
        />
      );
    }

    return <span css={spacer} />;
  }
}

export default injectIntl(Dropdown);
