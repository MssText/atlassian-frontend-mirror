import MockDate from 'mockdate';
import { mockEvents } from './_mocks';

jest.mock('react-lazily-render', () => (data: any) => data.content);
jest.mock('react-transition-group/Transition', () => (data: any) =>
  data.children,
);
jest.doMock('../../utils/analytics', () => mockEvents);

const mockAPIError = jest.fn();
jest.doMock('../../client/errors', () => ({
  APIError: mockAPIError,
}));

import React from 'react';
import { useEffect, useState, ReactNode, FC } from 'react';
import CardClient from '../../client';
import { Card } from '../Card';
import { Provider } from '../..';
import { fakeFactory, mocks, waitFor } from '../../utils/mocks';
import { render, cleanup, waitForElement } from '@testing-library/react';
import { JsonLd } from 'json-ld-types';
describe('smart-card: card states', () => {
  let mockClient: CardClient;
  let mockFetch: jest.Mock;
  let mockUrl: string;

  beforeEach(() => {
    mockFetch = jest.fn(() => Promise.resolve(mocks.success));
    mockClient = new (fakeFactory(mockFetch))();
    mockUrl = 'https://some.url';
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  describe('render method: withUrl', () => {
    describe('> state: loading', () => {
      it('inline: should render loading state initially', async () => {
        const { getByTestId } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
          </Provider>,
        );
        const loadingView = await waitForElement(() =>
          getByTestId('inline-card-resolving-view'),
        );
        expect(loadingView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('block: should render loading state initially', async () => {
        const { getByTestId } = render(
          <Provider client={mockClient}>
            <Card appearance="block" url={mockUrl} />
          </Provider>,
        );
        const loadingView = await waitForElement(() =>
          getByTestId('block-card-resolving-view'),
        );
        expect(loadingView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('embed: should render loading state initially', async () => {
        const { getByTestId } = render(
          <Provider client={mockClient}>
            <Card appearance="embed" url={mockUrl} />
          </Provider>,
        );
        const loadingView = await waitForElement(() =>
          getByTestId('embed-card-resolving-view'),
        );
        expect(loadingView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('should work correctly with cache', async () => {
        const DelayedCard: FC<{}> = () => {
          const [component, setComponent] = useState<ReactNode>(<></>);
          useEffect(() => {
            setTimeout(() => {
              setComponent(<Card appearance="inline" url={mockUrl} />);
            }, 500);
          });
          return <span>{component}</span>;
        };

        let resolvingView = null;
        const { getByText, getAllByText } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
            <DelayedCard />
          </Provider>,
        );
        expect(getByText(mockUrl)).toBeTruthy();
        // Then URL resolves, triggering update:
        resolvingView = await waitForElement(() => getByText('I love cheese'));
        expect(resolvingView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);

        await waitFor(500);

        resolvingView = await waitForElement(() =>
          getAllByText('I love cheese'),
        );
        expect(resolvingView).toBeTruthy();
        expect(resolvingView).toHaveLength(2);
        // Should not call out to ORS again for the same URL.
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('should work the same with stale cache after expiry', async () => {
        MockDate.reset();
        const DelayedCard: FC<{}> = () => {
          const [component, setComponent] = React.useState<ReactNode>(<></>);
          useEffect(() => {
            setTimeout(() => {
              setComponent(<Card appearance="inline" url={mockUrl} />);
            }, 500);
          });
          return <span>{component}</span>;
        };

        let resolvingView = null;
        const { getByText, getAllByText } = render(
          <Provider
            client={mockClient}
            cacheOptions={{ maxAge: 1, maxLoadingDelay: 10 }}
          >
            <Card appearance="inline" url={mockUrl} />
            <DelayedCard />
          </Provider>,
        );
        expect(getByText(mockUrl)).toBeTruthy();
        // Then URL resolves, triggering update:
        resolvingView = await waitForElement(() => getByText('I love cheese'));
        expect(resolvingView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);

        await waitFor(500);
        resolvingView = await waitForElement(() =>
          getAllByText('I love cheese'),
        );
        expect(resolvingView).toBeTruthy();
        expect(resolvingView).toHaveLength(2);
        // Should not call out to ORS again for the same URL.
        expect(mockFetch).toBeCalledTimes(2);
      });
    });

    describe('> state: resolved', () => {
      it('inline: should render with metadata when resolved', async () => {
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
          </Provider>,
        );
        const resolvedView = await waitForElement(() =>
          getByText('I love cheese'),
        );
        expect(resolvedView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('block: should render with metadata when resolved', async () => {
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="block" url={mockUrl} />
          </Provider>,
        );
        const resolvedViewName = await waitForElement(() =>
          getByText('I love cheese'),
        );
        const resolvedViewDescription = await waitForElement(() =>
          getByText('Here is your serving of cheese: 🧀'),
        );
        expect(resolvedViewName).toBeTruthy();
        expect(resolvedViewDescription).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('embed: should render with metadata when resolved', async () => {
        const { getByTestId } = render(
          <Provider client={mockClient}>
            <Card appearance="embed" url={mockUrl} />
          </Provider>,
        );
        const resolvedViewName = await waitForElement(() =>
          getByTestId('embed-card-resolved-view-frame'),
        );
        expect(resolvedViewName).toBeTruthy();
        expect(resolvedViewName.getAttribute('src')).toEqual(
          'https://www.ilovecheese.com',
        );
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('embed: should render with metadata when resolved, as block card - no preview present', async () => {
        const successWithoutPreview = {
          ...mocks.success,
          data: {
            ...mocks.success.data,
            preview: undefined,
          },
        } as JsonLd.Response;

        mockFetch.mockImplementationOnce(async () => successWithoutPreview);
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="embed" url={mockUrl} />
          </Provider>,
        );
        const resolvedViewName = await waitForElement(() =>
          getByText('I love cheese'),
        );
        const resolvedViewDescription = await waitForElement(() =>
          getByText('Here is your serving of cheese: 🧀'),
        );
        expect(resolvedViewName).toBeTruthy();
        expect(resolvedViewDescription).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('embed: should render with metadata when resolved, as block card - preview present, platform set', async () => {
        const successWithPreviewOnWeb = {
          ...mocks.success,
          data: {
            ...mocks.success.data,
            preview: {
              '@type': 'Link',
              href: 'https://some/preview',
              'atlassian:supportedPlatforms': ['web'],
            },
          },
        } as JsonLd.Response;

        mockFetch.mockImplementationOnce(async () => successWithPreviewOnWeb);
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="embed" url={mockUrl} platform="mobile" />
          </Provider>,
        );
        const resolvedViewName = await waitForElement(() =>
          getByText('I love cheese'),
        );
        const resolvedViewDescription = await waitForElement(() =>
          getByText('Here is your serving of cheese: 🧀'),
        );
        expect(resolvedViewName).toBeTruthy();
        expect(resolvedViewDescription).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('should re-render when URL changes', async () => {
        let resolvedView = null;
        const { getByText, rerender } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
          </Provider>,
        );
        resolvedView = await waitForElement(() => getByText('I love cheese'));
        expect(resolvedView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);

        rerender(
          <Provider client={mockClient}>
            <Card appearance="inline" url="https://google.com" />
          </Provider>,
        );
        resolvedView = await waitForElement(() => getByText('I love cheese'));
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(2);
      });

      it('should not re-render when appearance changes', async () => {
        let resolvedView = null;
        const { getByText, rerender } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
          </Provider>,
        );
        resolvedView = await waitForElement(() => getByText('I love cheese'));
        expect(resolvedView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);

        rerender(
          <Provider client={mockClient}>
            <Card appearance="block" url={mockUrl} />
          </Provider>,
        );
        resolvedView = await waitForElement(() => getByText('I love cheese'));
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });
    });

    describe('> state: forbidden', () => {
      describe('with auth services available', () => {
        it('inline: renders the forbidden view if no access, with auth prompt', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.forbidden);
          const { getByText, container } = render(
            <Provider client={mockClient}>
              <Card appearance="inline" url={mockUrl} />
            </Provider>,
          );
          const forbiddenLink = await waitForElement(() =>
            getByText(/Restricted link/),
          );
          const forbiddenLinkButton = container.querySelector(
            '[type="button"]',
          );
          expect(forbiddenLink).toBeTruthy();
          expect(forbiddenLinkButton).toBeTruthy();
          expect(forbiddenLinkButton!.innerHTML).toContain(
            'Try another account',
          );
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('block: renders the forbidden view if no access, with auth prompt', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.forbidden);
          const { getByText, getByTestId, container } = render(
            <Provider client={mockClient}>
              <Card appearance="block" url={mockUrl} />
            </Provider>,
          );
          const frame = await waitForElement(() =>
            getByTestId('block-card-forbidden-view'),
          );
          expect(frame).toBeTruthy();
          const forbiddenLink = await waitForElement(() => getByText(mockUrl));
          expect(forbiddenLink).toBeTruthy();
          const forbiddenLinkButton = container.querySelector('button');
          expect(forbiddenLinkButton).toBeTruthy();
          expect(forbiddenLinkButton!.textContent).toContain(
            'Try another account',
          );
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('embed: renders the forbidden view if no access, with auth prompt', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.forbidden);
          const { getByText, container } = render(
            <Provider client={mockClient}>
              <Card appearance="embed" url={mockUrl} />
            </Provider>,
          );
          await new Promise(resolve => setTimeout(resolve, 1000));

          const forbiddenLink = await waitForElement(() =>
            getByText(/Restricted link/),
          );
          expect(forbiddenLink).toBeTruthy();
          const forbiddenLinkButton = container.querySelector('button');
          expect(forbiddenLinkButton).toBeTruthy();
          expect(forbiddenLinkButton!.textContent).toContain(
            'Try another account',
          );
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });
      });

      describe('with no auth services available', () => {
        it('inline: renders the forbidden view if no access, no auth prompt', async () => {
          mocks.forbidden.meta.auth = [];
          mockFetch.mockImplementationOnce(async () => mocks.forbidden);
          const { getByText, container } = render(
            <Provider client={mockClient}>
              <Card appearance="inline" url={mockUrl} />
            </Provider>,
          );
          const forbiddenLinkTruncated = mockUrl.slice(0, 5);
          const forbiddenLink = await waitForElement(() =>
            getByText(new RegExp(`${forbiddenLinkTruncated}.*?`)),
          );
          const forbiddenLinkButton = container.querySelector('button');
          expect(forbiddenLink).toBeTruthy();
          expect(forbiddenLinkButton).toBeFalsy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('block: renders the forbidden view if no access, no auth prompt', async () => {
          mocks.forbidden.meta.auth = [];
          mockFetch.mockImplementationOnce(async () => mocks.forbidden);
          const { getByText, getByTestId, container } = render(
            <Provider client={mockClient}>
              <Card appearance="block" url={mockUrl} />
            </Provider>,
          );
          const frame = await waitForElement(() =>
            getByTestId('block-card-forbidden-view'),
          );
          expect(frame).toBeTruthy();
          const forbiddenLink = await waitForElement(() => getByText(mockUrl));
          const forbiddenLinkButton = container.querySelector('button');
          expect(forbiddenLink).toBeTruthy();
          expect(forbiddenLinkButton).toBeFalsy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('embed: renders the forbidden view if no access, no auth prompt', async () => {
          mocks.forbidden.meta.auth = [];
          mockFetch.mockImplementationOnce(async () => mocks.forbidden);
          const { getByText } = render(
            <Provider client={mockClient}>
              <Card appearance="embed" url={mockUrl} />
            </Provider>,
          );
          const forbiddenLink = await waitForElement(() =>
            getByText(/Restricted link/),
          );
          expect(forbiddenLink).toBeTruthy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });
      });
    });

    describe('> state: unauthorized', () => {
      describe('with auth services available', () => {
        it('inline: renders with connect flow', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText, container } = render(
            <Provider client={mockClient}>
              <Card appearance="inline" url={mockUrl} />
            </Provider>,
          );
          const unauthorizedLink = await waitForElement(() =>
            getByText(/Connect to preview/),
          );
          const unauthorizedLinkButton = container.querySelector(
            '[type="button"]',
          );
          expect(unauthorizedLink).toBeTruthy();
          expect(unauthorizedLinkButton).toBeTruthy();
          expect(unauthorizedLinkButton!.innerHTML).toContain('Connect');
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('block: renders with connect flow', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText, getByTestId } = render(
            <Provider client={mockClient}>
              <Card appearance="block" url={mockUrl} />
            </Provider>,
          );
          const frame = await waitForElement(() =>
            getByTestId('block-card-unauthorized-view'),
          );
          expect(frame).toBeTruthy();
          const unauthorizedLink = await waitForElement(() =>
            getByText(mockUrl),
          );
          expect(unauthorizedLink).toBeTruthy();
          const unauthorizedLinkButton = getByTestId('button-connect-account');
          expect(unauthorizedLinkButton).toBeTruthy();
          expect(unauthorizedLinkButton!.innerHTML).toContain('Connect');
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('embed: renders with connect flow', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText, getByTestId } = render(
            <Provider client={mockClient}>
              <Card
                testId="block-unauthorized-connect"
                appearance="embed"
                url={mockUrl}
              />
            </Provider>,
          );
          const unauthorizedLink = await waitForElement(() =>
            getByText(/Connect your.*?account/),
          );

          expect(unauthorizedLink).toBeTruthy();
          const unauthorizedLinkButton = getByTestId('button-connect-account');
          expect(unauthorizedLinkButton).toBeTruthy();
          expect(unauthorizedLinkButton!.innerHTML).toContain('Connect');
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });
      });

      describe('with auth services not available', () => {
        it('inline: renders without connect flow', async () => {
          mocks.unauthorized.meta.auth = [];
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText, container } = render(
            <Provider client={mockClient}>
              <Card appearance="inline" url={mockUrl} />
            </Provider>,
          );
          const unauthorizedLink = await waitForElement(() =>
            getByText(mockUrl),
          );
          const unauthorizedLinkButton = container.querySelector('button');
          expect(unauthorizedLink).toBeTruthy();
          expect(unauthorizedLinkButton).toBeFalsy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('block: renders without connect flow', async () => {
          mocks.unauthorized.meta.auth = [];
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText, getByTestId, container } = render(
            <Provider client={mockClient}>
              <Card appearance="block" url={mockUrl} />
            </Provider>,
          );
          const frame = await waitForElement(() =>
            getByTestId('block-card-unauthorized-view'),
          );
          expect(frame).toBeTruthy();
          const unauthorizedLink = await waitForElement(() =>
            getByText(mockUrl),
          );
          const unauthorizedLinkButton = container.querySelector('button');
          expect(unauthorizedLink).toBeTruthy();
          expect(unauthorizedLinkButton).toBeFalsy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('embed: renders without connect flow', async () => {
          mocks.unauthorized.meta.auth = [];
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText } = render(
            <Provider client={mockClient}>
              <Card appearance="embed" url={mockUrl} />
            </Provider>,
          );
          const unauthorizedLink = await waitForElement(() =>
            getByText(/Connect your.*?account/),
          );
          expect(unauthorizedLink).toBeTruthy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });
      });

      describe('with authFlow explicitly disabled', () => {
        it('inline: renders as blue link', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText } = render(
            <Provider client={mockClient} authFlow="disabled">
              <Card appearance="inline" url={mockUrl} />
            </Provider>,
          );
          const dumbLink = await waitForElement(() => getByText(mockUrl));
          expect(dumbLink).toBeTruthy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('block: renders as blue link', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText } = render(
            <Provider client={mockClient} authFlow="disabled">
              <Card appearance="block" url={mockUrl} />
            </Provider>,
          );
          const dumbLink = await waitForElement(() => getByText(mockUrl));
          expect(dumbLink).toBeTruthy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });

        it('embed: renders in error state', async () => {
          mockFetch.mockImplementationOnce(async () => mocks.unauthorized);
          const { getByText } = render(
            <Provider client={mockClient} authFlow="disabled">
              <Card appearance="embed" url={mockUrl} />
            </Provider>,
          );
          const errorView = await waitForElement(() =>
            getByText(/We couldn't load this link/),
          );
          expect(errorView).toBeTruthy();
          expect(mockFetch).toBeCalled();
          expect(mockFetch).toBeCalledTimes(1);
        });
      });
    });

    describe('> state: error', () => {
      it('inline: renders blue link when resolve fails', async () => {
        mockFetch.mockImplementationOnce(
          () =>
            new Promise((_resolve, reject) =>
              reject(new Error('Something went wrong')),
            ),
        );
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
          </Provider>,
        );
        const dumbLink = await waitForElement(() => getByText(mockUrl));
        expect(dumbLink).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('inline: renders error card when link not found', async () => {
        mockFetch.mockImplementationOnce(async () => mocks.notFound);
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} />
          </Provider>,
        );
        const errorView = await waitForElement(() =>
          getByText(/Can't find link/),
        );
        expect(errorView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('block: renders not found card when link not found', async () => {
        mockFetch.mockImplementationOnce(async () => mocks.notFound);
        const { getByText, getByTestId } = render(
          <Provider client={mockClient}>
            <Card appearance="block" url={mockUrl} />
          </Provider>,
        );
        const frame = await waitForElement(() =>
          getByTestId('block-card-not-found-view'),
        );
        expect(frame).toBeTruthy();
        const link = await waitForElement(() => getByText(mockUrl));
        expect(link).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });

      it('embed: renders not found card when link not found', async () => {
        mockFetch.mockImplementationOnce(async () => mocks.notFound);
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="embed" url={mockUrl} />
          </Provider>,
        );
        const errorView = await waitForElement(() =>
          getByText(/Uh oh. We can't find this link!/),
        );
        expect(errorView).toBeTruthy();
        expect(mockFetch).toBeCalled();
        expect(mockFetch).toBeCalledTimes(1);
      });
    });
  });

  describe('render method: withData', () => {
    describe('> state: resolved', () => {
      it('inline: renders successfully with data', async () => {
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="inline" url={mockUrl} data={mocks.success.data} />
          </Provider>,
        );
        const resolvedView = await waitForElement(() =>
          getByText('I love cheese'),
        );
        expect(resolvedView).toBeTruthy();
      });

      it('block: renders successfully with data', async () => {
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="block" url={mockUrl} data={mocks.success.data} />
          </Provider>,
        );
        const resolvedViewName = await waitForElement(() =>
          getByText('I love cheese'),
        );
        const resolvedViewDescription = await waitForElement(() =>
          getByText('Here is your serving of cheese: 🧀'),
        );
        expect(resolvedViewName).toBeTruthy();
        expect(resolvedViewDescription).toBeTruthy();
      });

      it('embed: renders successfully with data', async () => {
        const { getByText } = render(
          <Provider client={mockClient}>
            <Card appearance="embed" url={mockUrl} data={mocks.success.data} />
          </Provider>,
        );
        const resolvedViewName = await waitForElement(() =>
          getByText('I love cheese'),
        );
        const resolvedViewDescription = await waitForElement(() =>
          getByText('Here is your serving of cheese: 🧀'),
        );
        expect(resolvedViewName).toBeTruthy();
        expect(resolvedViewDescription).toBeTruthy();
      });
    });
  });
});
