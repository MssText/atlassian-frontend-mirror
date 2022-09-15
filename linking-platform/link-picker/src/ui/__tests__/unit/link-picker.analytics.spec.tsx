import React from 'react';

import { renderWithIntl as render } from '@atlaskit/link-test-helpers';
import { MockLinkPickerPlugin } from '@atlaskit/link-test-helpers/link-picker';
import { fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { AnalyticsListener, UIAnalyticsEvent } from '@atlaskit/analytics-next';
import matches from 'lodash/matches';

import { LinkPicker, LinkPickerProps } from '../../../';
import { ANALYTICS_CHANNEL } from '../../../common/constants';
import { testIds } from '../../link-picker';
import { PACKAGE_DATA as ROOT_CONTEXT } from '../../';

expect.extend({
  toBeFiredWithAnalyticEventOnce(analyticsListenerSpy, event, channel) {
    const matchingEvents = analyticsListenerSpy.mock.calls.filter(
      (arg: any[]) => matches(event)(arg[0]),
    );

    if (matchingEvents.length === 1) {
      if (channel && matchingEvents[0][1] !== channel) {
        return {
          message: () =>
            `expected analytic event to have been fired once on channel '${channel}', it actually fired on channel '${matchingEvents[0][1]}'`,
          pass: false,
        };
      }

      return {
        message: () => `analytic event was fired once`,
        pass: true,
      };
    } else {
      return {
        message: () => {
          if (analyticsListenerSpy.mock.calls.length === 0) {
            return `no events were fired!`;
          }
          return `expected analytic event to have been fired once, \r\rexpected: ${JSON.stringify(
            event,
          )} \r\rreceived: ${analyticsListenerSpy.mock.calls
            .map(([x]: any[]) => JSON.stringify(x))
            .join('\r\r')}`;
        },
        pass: false,
      };
    }
  },
});

describe('LinkPicker analytics', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setupLinkPicker = ({
    url = '',
    plugins,
    ...props
  }: Partial<LinkPickerProps> = {}) => {
    const spy = jest.fn();
    const onSubmit = jest.fn();

    const wrappedLinkPicker = render(
      <AnalyticsListener channel={ANALYTICS_CHANNEL} onEvent={spy}>
        <LinkPicker
          url={url}
          onSubmit={onSubmit}
          plugins={plugins ?? []}
          onCancel={jest.fn()}
          onContentResize={jest.fn()}
          {...props}
        />
      </AnalyticsListener>,
    );

    return {
      spy,
      onSubmit,
      testIds,
      wrappedLinkPicker,
      urlField: () => screen.findByTestId(testIds.urlInputField),
    };
  };

  it('should fire `ui.form.submitted.linkPicker` and emit a clone of the `ui.form.submitted.linkPicker` event on form submission', async () => {
    const { onSubmit, spy, urlField } = setupLinkPicker();

    userEvent.type(await urlField(), 'www.atlassian.com');
    spy.mockClear();
    fireEvent.submit(await urlField());

    const payload = {
      action: 'submitted',
      eventType: 'ui',
      actionSubject: 'form',
      actionSubjectId: 'linkPicker',
      attributes: {
        displayTextFieldContent: null,
        displayTextFieldContentInputMethod: null,
        linkFieldContent: 'text_string',
        linkFieldContentInputMethod: 'manual',
        linkState: 'newLink',
      },
    };

    const context = [ROOT_CONTEXT];

    expect(spy).toBeFiredWithAnalyticEventOnce({
      hasFired: true,
      context,
      payload,
    });

    // Second onSubmit argument should be a `UIAnalyticsEvent` match the event dispatched
    // except it should not yet have been fired (`hasFired` = false)
    expect(onSubmit).toHaveBeenCalledWith<[{}, UIAnalyticsEvent]>(
      expect.objectContaining({
        url: 'http://www.atlassian.com',
      }),
      expect.any(UIAnalyticsEvent),
    );
    expect(onSubmit.mock.calls[0][1]).toStrictEqual(
      expect.objectContaining({
        hasFired: false,
        context,
        payload,
      }),
    );
  });

  it('should fire `ui.inlineDialog.viewed.linkPicker` once on picker mounting', async () => {
    const { spy } = setupLinkPicker();

    expect(spy).toBeFiredWithAnalyticEventOnce({
      hasFired: true,
      context: [ROOT_CONTEXT],
      payload: {
        action: 'viewed',
        eventType: 'ui',
        actionSubject: 'inlineDialog',
        actionSubjectId: 'linkPicker',
        attributes: {
          linkState: 'newLink',
        },
      },
    });
  });

  it('should fire `ui.inlineDialog.closed.linkPicker` once on picker unmounting', async () => {
    const { spy, wrappedLinkPicker } = setupLinkPicker();

    wrappedLinkPicker.unmount();

    expect(spy).toBeFiredWithAnalyticEventOnce({
      hasFired: true,
      context: [ROOT_CONTEXT],
      payload: {
        action: 'closed',
        eventType: 'ui',
        actionSubject: 'inlineDialog',
        actionSubjectId: 'linkPicker',
        attributes: {
          linkState: 'newLink',
        },
      },
    });
  });

  describe('linkState attribute', () => {
    it('should be `newLink` when URL prop is NOT provided', async () => {
      const { spy, urlField } = setupLinkPicker();

      userEvent.type(await urlField(), 'www.atlassian.com');
      fireEvent.submit(await urlField());

      expect(spy).toBeFiredWithAnalyticEventOnce({
        hasFired: true,
        context: [ROOT_CONTEXT],
        payload: {
          action: 'submitted',
          eventType: 'ui',
          actionSubject: 'form',
          actionSubjectId: 'linkPicker',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: 'text_string',
            linkFieldContentInputMethod: 'manual',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });

    it('should be `editLink` when URL prop IS provided', async () => {
      const { spy, urlField } = setupLinkPicker({
        url: 'https://atlassian.com',
      });

      spy.mockClear();
      fireEvent.submit(await urlField());

      expect(spy).toBeFiredWithAnalyticEventOnce({
        hasFired: true,
        payload: {
          action: 'submitted',
          eventType: 'ui',
          actionSubject: 'form',
          actionSubjectId: 'linkPicker',
          attributes: {
            linkState: 'editLink',
            linkFieldContent: 'url',
            linkFieldContentInputMethod: null,
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });
  });

  describe('input tracking', () => {
    it('should correctly track url input field even when immediately submitting after input change', async () => {
      const { spy, urlField } = setupLinkPicker({
        url: 'https://google.com',
      });

      userEvent.clear(await urlField());
      userEvent.type(await urlField(), 'www.atlassian.com');
      fireEvent.submit(await urlField());

      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'submitted',
          eventType: 'ui',
          actionSubject: 'form',
          actionSubjectId: 'linkPicker',
          attributes: {
            linkState: 'editLink',
            linkFieldContent: 'text_string',
            linkFieldContentInputMethod: 'manual',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });

    it('should track url input field content as `url` when the field has a valid url', async () => {
      const { spy, urlField } = setupLinkPicker();

      userEvent.type(await urlField(), 'www.atlassian.com');
      spy.mockClear();
      fireEvent.submit(await urlField());

      expect(spy).toBeFiredWithAnalyticEventOnce({
        hasFired: true,
        payload: {
          action: 'submitted',
          eventType: 'ui',
          actionSubject: 'form',
          actionSubjectId: 'linkPicker',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: 'text_string',
            linkFieldContentInputMethod: 'manual',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });

    it('should fire `field updated` event when focus leaves url input field', async () => {
      const { spy, urlField } = setupLinkPicker({
        url: 'https://google.com',
      });

      userEvent.type(await urlField(), 'https://www.atlassian.com');
      spy.mockClear();
      userEvent.tab();

      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'updated',
          eventType: 'ui',
          actionSubject: 'textField',
          actionSubjectId: 'linkField',
          attributes: {
            linkState: 'editLink',
            linkFieldContent: 'url',
            linkFieldContentInputMethod: 'manual',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });

    it('should not fire `field updated` event even if there is onChange events if the value net value change between focus and blur is no change', async () => {
      const { spy, urlField } = setupLinkPicker({
        url: 'https://google.com',
      });

      userEvent.clear(await urlField());
      userEvent.keyboard('https://www.atlassian.com');
      userEvent.tab();
      userEvent.keyboard('https://google.com');

      expect(spy).not.toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'updated',
          eventType: 'ui',
          actionSubject: 'field',
          actionSubjectId: 'linkField',
        },
      });
    });

    it('should track the displayText field', async () => {
      const { spy } = setupLinkPicker();

      // Tab to displayText field
      userEvent.tab();
      spy.mockClear();
      userEvent.type(
        screen.getByTestId(testIds.textInputField),
        'Custom Display Text',
      );
      // Blur display text
      userEvent.tab();

      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'updated',
          eventType: 'ui',
          actionSubject: 'textField',
          actionSubjectId: 'displayTextField',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: null,
            linkFieldContentInputMethod: null,
            displayTextFieldContent: 'text_string',
            displayTextFieldContentInputMethod: 'manual',
          },
        },
      });
    });

    it('should track insertFromPaste input events as `paste` input method', async () => {
      const { spy, urlField } = setupLinkPicker();

      const url = 'https://atlassian.com';
      await urlField();

      spy.mockClear();

      fireEvent.input(await urlField(), {
        inputType: 'insertFromPaste',
        target: { value: url },
      });

      // Tab to clear button
      userEvent.tab();

      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'updated',
          eventType: 'ui',
          actionSubject: 'textField',
          actionSubjectId: 'linkField',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: 'url',
            linkFieldContentInputMethod: 'paste',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });

      spy.mockClear();

      // Tab to displayText field
      userEvent.tab();

      fireEvent.input(await screen.findByTestId(testIds.textInputField), {
        inputType: 'insertFromPaste',
        target: { value: 'Custom Title' },
      });

      // Blur display text
      userEvent.tab();

      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'updated',
          eventType: 'ui',
          actionSubject: 'textField',
          actionSubjectId: 'displayTextField',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: 'url',
            linkFieldContentInputMethod: 'paste',
            displayTextFieldContent: 'text_string',
            displayTextFieldContentInputMethod: 'paste',
          },
        },
      });
    });
  });

  describe('with plugins', () => {
    const setupWithPlugins: typeof setupLinkPicker = (props = {}) =>
      setupLinkPicker({
        plugins: [new MockLinkPickerPlugin()],
        ...props,
      });

    it('should track the url field value as `url` when submitting by clicking a result', async () => {
      const { spy } = setupWithPlugins();

      userEvent.click(
        (await screen.findAllByTestId(testIds.searchResultItem))[0],
      );

      // Should not have fired a text field update
      expect(spy).not.toBeFiredWithAnalyticEventOnce(
        {
          payload: {
            action: 'updated',
            eventType: 'ui',
            actionSubject: 'textField',
            actionSubjectId: 'displayTextField',
          },
        },
        ANALYTICS_CHANNEL,
      );
      // Should have tracked content as url and input method as searchResult
      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'submitted',
          eventType: 'ui',
          actionSubject: 'form',
          actionSubjectId: 'linkPicker',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: 'url',
            linkFieldContentInputMethod: 'searchResult',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });

    it('should track the url field value as `url` when submitting by using typeahead/autocomplete (keydown pressing) and pressing enter', async () => {
      const { spy, urlField } = setupWithPlugins();

      expect(await urlField()).toHaveFocus();
      spy.mockClear();
      userEvent.keyboard('{arrowdown}');
      userEvent.keyboard('{enter}');

      // Should not have fired a text field update
      expect(spy).not.toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'updated',
          eventType: 'ui',
          actionSubject: 'textField',
          actionSubjectId: 'displayTextField',
        },
      });
      // Should have tracked content as url and input method as searchResult
      expect(spy).toBeFiredWithAnalyticEventOnce({
        payload: {
          action: 'submitted',
          eventType: 'ui',
          actionSubject: 'form',
          actionSubjectId: 'linkPicker',
          attributes: {
            linkState: 'newLink',
            linkFieldContent: 'url',
            linkFieldContentInputMethod: 'searchResult',
            displayTextFieldContent: null,
            displayTextFieldContentInputMethod: null,
          },
        },
      });
    });
  });
});
