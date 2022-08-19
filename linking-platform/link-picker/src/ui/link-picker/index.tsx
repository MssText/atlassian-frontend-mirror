/** @jsx jsx */
import {
  FormEvent,
  Fragment,
  KeyboardEvent,
  useCallback,
  useLayoutEffect,
  useReducer,
} from 'react';
import { jsx } from '@emotion/react';
import { useIntl, IntlShape, FormattedMessage } from 'react-intl-next';
import { useAnalyticsEvents } from '@atlaskit/analytics-next';

import Button, { ButtonGroup } from '@atlaskit/button';
import { FormFooter } from '@atlaskit/form';
import EditorSearchIcon from '@atlaskit/icon/glyph/editor/search';
import Tabs, { Tab, TabList } from '@atlaskit/tabs';
import VisuallyHidden from '@atlaskit/visually-hidden';

import {
  LinkSearchListItemData,
  LinkInputType,
  LinkPickerPlugin,
} from '../types';

import createEventPayload from '../../analytics.codegen';

import { ANALYTICS_CHANNEL } from '../../common/constants';
import { usePlugins } from '../../services/use-plugins';
import { useSearchQuery } from '../../services/use-search-query';

import { messages } from './messages';
import PanelTextInput from './text-input';
import LinkSearchList from './link-search-list';
import { normalizeUrl, isSafeUrl } from './url';
import {
  rootContainerStyles,
  searchIconStyles,
  listTitleStyles,
  tabsWrapperStyles,
} from './styled';
import { browser } from './browser';
import Announcer from './announcer';
import LinkSearchNoResults from './link-search-no-results';
import { transformTimeStamp } from './transformTimeStamp';
import LinkSearchError from './link-search-error';

export const RECENT_SEARCH_LIST_SIZE = 5;
export const CONTACT_SUPPORT_LINK = 'https://support.atlassian.com/contact/';

export const testIds = {
  linkPicker: 'link-picker',
  urlInputField: 'link-url',
  textInputField: 'link-text',
  searchIcon: 'link-picker-search-icon',
  insertButton: 'link-picker-insert-button',
  cancelButton: 'link-picker-cancel-button',
  clearUrlButton: 'clear-text',
  resultListTitle: 'link-picker-list-title',
  emptyResultPage: 'link-search-no-results',
  searchResultList: 'link-search-list',
  searchResultItem: 'link-search-list-item',
  searchResultLoadingIndicator: 'link-picker.results-loading-indicator',
  urlError: 'link-error',
  tabList: 'link-picker-tabs',
  tabItem: 'link-picker-tab',
  searchError: 'link-search-error',
};

interface Meta {
  /** Indicates how the link was picked. */
  inputMethod: LinkInputType;
}

interface OnSubmitParameter {
  /** The `url` of the linked resource. */
  url: string;
  /** The desired text to be displayed alternatively to the title of the linked resource. */
  displayText: string | null;
  /** The resolved `title` of the resource at the time of link picking (if applicable, null if not known). */
  title: string | null;
  /** Meta data about the link picking submission. */
  meta: Meta;
  /**
   * The input value of the `url` field at time of submission if inserted "manually".
   * This can useful if the `url` was manually inserted with a value that is different from the normalised value returned as `url`.
   * @example
   * { url: 'https://google.com', rawUrl: 'google.com' }
   */
  rawUrl?: string;
}

export interface LinkPickerProps {
  /** Callback to fire on form submission. */
  onSubmit: (arg: OnSubmitParameter) => void;
  /** Callback to fire when the cancel button is clicked. */
  onCancel: () => void;
  /** Callback to fire when content is changed inside the link picker e.g. items, when loading, tabs */
  onContentResize?: () => void;
  /** The url of the linked resource for editing. */
  url?: string;
  /** The desired text to be displayed alternatively to the title of the linked resource for editing. */
  displayText?: string | null;
  /** Plugins that provide link suggestions / search capabilities. */
  plugins?: LinkPickerPlugin[];
}

export interface PickerState {
  selectedIndex: number;
  activeIndex: number;
  url: string;
  displayText: string;
  invalidUrl: boolean;
  activeTab: number;
}

type LinkPickerForm = 'url' | 'displayText';

const initState = {
  url: '',
  displayText: '',
  activeIndex: -1,
  selectedIndex: -1,
  invalidUrl: false,
  activeTab: 0,
};

function reducer(state: PickerState, payload: Partial<PickerState>) {
  if (payload.url && state.url !== payload.url) {
    return {
      ...state,
      invalidUrl: false,
      selectedIndex:
        isSafeUrl(payload.url) && payload.url.length ? -1 : state.selectedIndex,
      ...payload,
    };
  }

  return { ...state, ...payload };
}

function LinkPicker({
  onSubmit,
  onCancel,
  onContentResize,
  plugins,
  url: initUrl,
  displayText: initDisplayText,
}: LinkPickerProps) {
  const { createAnalyticsEvent } = useAnalyticsEvents();
  const [state, dispatch] = useReducer(reducer, {
    ...initState,
    url: normalizeUrl(initUrl) || '',
    displayText: initDisplayText || '',
  });

  const {
    activeIndex,
    selectedIndex,
    url,
    displayText,
    invalidUrl,
    activeTab,
  } = state;

  const intl = useIntl();
  const queryState = useSearchQuery(state);

  const {
    items,
    isLoading,
    isActivePlugin,
    tabs,
    error,
    retry,
    errorFallback,
  } = usePlugins(queryState, activeTab, plugins);

  const isEditing = !!initUrl;
  const selectedItem: LinkSearchListItemData | undefined =
    items?.[selectedIndex];
  const isSelectedItem = selectedItem?.url === url;

  useLayoutEffect(() => {
    if (onContentResize) {
      onContentResize();
    }
  }, [onContentResize, items, isLoading, isActivePlugin, tabs]);

  const handleChangeUrl = useCallback((url: string) => {
    dispatch({
      url,
    });
  }, []);

  const handleChangeText = useCallback((displayText: string) => {
    dispatch({
      displayText,
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const { keyCode } = event;
      const KEY_CODE_ARROW_DOWN = 40;
      const KEY_CODE_ARROW_UP = 38;

      if (!items || !items.length) {
        return;
      }

      let updatedIndex = activeIndex;
      switch (keyCode) {
        case KEY_CODE_ARROW_DOWN: // down
          event.preventDefault();
          updatedIndex = (activeIndex + 1) % items.length;
          break;

        case KEY_CODE_ARROW_UP: // up
          event.preventDefault();
          updatedIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          break;
      }

      if (
        [KEY_CODE_ARROW_DOWN, KEY_CODE_ARROW_UP].includes(keyCode) &&
        items[updatedIndex]
      ) {
        dispatch({
          activeIndex: updatedIndex,
          selectedIndex: updatedIndex,
          url: items[updatedIndex].url,
          invalidUrl: false,
        });
      }
    },
    [activeIndex, items],
  );

  const handleClear = useCallback((field: LinkPickerForm) => {
    dispatch({
      [field]: '',
    });
  }, []);

  const handleMouseEnterResultItem = useCallback(
    (objectId: string) => {
      const index = items?.findIndex(item => item.objectId === objectId);
      dispatch({
        activeIndex: index ?? -1,
      });
    },
    [items],
  );

  const handleMouseLeaveResultItem = useCallback(
    (objectId: string) => {
      const index = items?.findIndex(item => item.objectId === objectId);
      // This is to avoid updating index that was set by other mouseenter event
      if (activeIndex === index) {
        dispatch({
          activeIndex: -1,
        });
      }
    },
    [activeIndex, items],
  );

  const handleInsert = useCallback(
    (url: string, title: string | null, inputType: LinkInputType) => {
      const event = createAnalyticsEvent(
        createEventPayload('form.submitted.linkPicker', {}),
      );

      event.fire(ANALYTICS_CHANNEL);

      onSubmit({
        url,
        displayText: displayText || null,
        title: title || null,
        meta: { inputMethod: inputType },
        ...(inputType === 'manual' ? { rawUrl: state.url } : {}),
      });
    },
    [displayText, onSubmit, state.url, createAnalyticsEvent],
  );

  const handleSelected = useCallback(
    (objectId: string) => {
      const selectedItem = items?.find(item => item.objectId === objectId);

      if (selectedItem) {
        const { url, name } = selectedItem;
        dispatchEvent(new Event('submit'));
        handleInsert(url, name, 'typeAhead');
      }
    },
    [handleInsert, items],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSelectedItem && selectedItem) {
        return handleInsert(selectedItem.url, selectedItem.name, 'typeAhead');
      }

      const normalized = normalizeUrl(url);
      if (normalized) {
        return handleInsert(normalized, null, 'manual');
      }

      return dispatch({
        invalidUrl: true,
      });
    },
    [handleInsert, isSelectedItem, selectedItem, url],
  );

  const linkPlaceHolder = isActivePlugin
    ? messages.placeholder
    : messages.linkPlaceholder;

  const linkListTitle =
    queryState?.query?.length !== 0
      ? messages.titleResults
      : messages.titleRecentlyViewed;

  const insertButtonMsg = isEditing
    ? messages.saveButton
    : messages.insertButton;

  const noResults = items?.length === 0 && !error;

  const screenReaderDescriptionId = 'search-recent-links-field-description';
  const linkSearchListId = 'link-picker-search-list';
  const ariaActiveDescendant =
    selectedIndex > -1 ? `link-search-list-item-${selectedIndex}` : '';

  // Added workaround with a screen reader Announcer specifically for VoiceOver + Safari
  // as the Aria design pattern for combobox does not work in this case
  // for details: https://a11y-internal.atlassian.net/browse/AK-740
  const screenReaderText =
    browser.safari && getScreenReaderText(items ?? [], selectedIndex, intl);

  const searchIcon = isActivePlugin && (
    <span css={searchIconStyles} data-testid={testIds.searchIcon}>
      <EditorSearchIcon size="medium" label={''} />
    </span>
  );

  return (
    <form
      data-testid={testIds.linkPicker}
      css={rootContainerStyles}
      onSubmit={handleSubmit}
    >
      {screenReaderText && (
        <Announcer
          ariaLive="assertive"
          text={screenReaderText}
          ariaRelevant="additions"
          delay={250}
        />
      )}
      <VisuallyHidden id={screenReaderDescriptionId}>
        <FormattedMessage {...messages.searchLinkAriaDescription} />
      </VisuallyHidden>
      <PanelTextInput
        role="combobox"
        autoComplete="off"
        name="url"
        testId={testIds.urlInputField}
        label={intl.formatMessage(messages.linkLabel)}
        placeholder={intl.formatMessage(linkPlaceHolder)}
        value={url}
        autoFocus
        elemBeforeInput={searchIcon}
        clearLabel={intl.formatMessage(messages.clearLink)}
        aria-expanded
        aria-autocomplete="list"
        aria-controls={linkSearchListId}
        aria-activedescendant={ariaActiveDescendant}
        aria-describedby={screenReaderDescriptionId}
        error={invalidUrl ? intl.formatMessage(messages.linkInvalid) : null}
        onClear={handleClear}
        onKeyDown={handleKeyDown}
        onChange={handleChangeUrl}
      />
      <PanelTextInput
        autoComplete="off"
        name="displayText"
        testId={testIds.textInputField}
        value={displayText}
        label={intl.formatMessage(messages.linkTextLabel)}
        placeholder={intl.formatMessage(messages.linkTextPlaceholder)}
        clearLabel={intl.formatMessage(messages.clearText)}
        aria-label={intl.formatMessage(messages.linkAriaLabel)}
        onClear={handleClear}
        onKeyDown={handleKeyDown}
        onChange={handleChangeText}
      />
      {queryState && (
        <Fragment>
          {tabs.length > 0 && (
            <div css={tabsWrapperStyles}>
              <Tabs
                id={testIds.tabList}
                testId={testIds.tabList}
                onChange={activeTab =>
                  dispatch({
                    selectedIndex: -1,
                    activeIndex: -1,
                    invalidUrl: false,
                    activeTab,
                  })
                }
              >
                <TabList>
                  {tabs.map(tab => (
                    <Tab key={tab.tabTitle} testId={testIds.tabItem}>
                      {tab.tabTitle}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </div>
          )}
          {!!items?.length && (
            <div
              css={listTitleStyles}
              id={testIds.resultListTitle}
              data-testid={testIds.resultListTitle}
            >
              <FormattedMessage {...linkListTitle} />
            </div>
          )}
          <VisuallyHidden id="fabric.smartcard.linkpicker.suggested.results">
            {url && (
              <FormattedMessage
                {...messages.searchLinkResults}
                values={{ count: items?.length ?? 0 }}
                aria-live="polite"
                aria-atomic="true"
              />
            )}
          </VisuallyHidden>
          <LinkSearchList
            ariaLabelledBy={testIds.resultListTitle}
            ariaControls="fabric.smartcard.linkpicker.suggested.results"
            id={linkSearchListId}
            role="listbox"
            items={items ?? []}
            isLoading={isLoading}
            selectedIndex={selectedIndex}
            activeIndex={activeIndex}
            onSelect={handleSelected}
            onMouseEnter={handleMouseEnterResultItem}
            onMouseLeave={handleMouseLeaveResultItem}
          />

          {error &&
            (errorFallback?.(error, retry) ?? (
              <LinkSearchError
                testId={testIds.searchError}
                header={intl.formatMessage(messages.searchErrorHeader)}
                description={
                  <FormattedMessage
                    {...messages.searchErrorDescription}
                    values={{
                      a: (label: string) => (
                        <Button
                          appearance="link"
                          spacing="none"
                          href={CONTACT_SUPPORT_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {label}
                        </Button>
                      ),
                    }}
                  />
                }
              />
            ))}

          {noResults && (
            <LinkSearchNoResults
              testId={testIds.emptyResultPage}
              header={intl.formatMessage(messages.noResults)}
              description={intl.formatMessage(messages.noResultsDescription)}
            />
          )}
        </Fragment>
      )}
      <FormFooter align="end">
        <ButtonGroup>
          <Button
            appearance="default"
            onClick={onCancel}
            testId={testIds.cancelButton}
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            type="submit"
            appearance="primary"
            testId={testIds.insertButton}
          >
            {intl.formatMessage(insertButtonMsg)}
          </Button>
        </ButtonGroup>
      </FormFooter>
    </form>
  );
}

export default LinkPicker;

function getScreenReaderText(
  items: LinkSearchListItemData[],
  selectedIndex: number,
  intl: IntlShape,
): string | undefined {
  if (items.length && selectedIndex > -1) {
    const { name, container, lastUpdatedDate, lastViewedDate } = items[
      selectedIndex
    ];

    const date = transformTimeStamp(intl, lastViewedDate, lastUpdatedDate);
    const formattedDate = [date?.pageAction, date?.dateString, date?.timeSince]
      .filter(Boolean)
      .join(' ');
    return [name, container, formattedDate].filter(Boolean).join(', ');
  }
}
