import React from 'react';
import { FC } from 'react';
import {
  CardLinkView,
  InlineCardResolvedView,
  InlineCardResolvingView,
  InlineCardErroredView,
  InlineCardForbiddenView,
  InlineCardUnauthorizedView,
} from '@atlaskit/media-ui';
import { InlineCardProps } from './types';
import { getEmptyJsonLd } from '../../utils/jsonld';
import { extractInlineProps } from '../../extractors/inline';
import { JsonLd } from 'json-ld-types';
import { extractProvider } from '../../extractors/common/context';

export const InlineCard: FC<InlineCardProps> = ({
  url,
  cardState,
  handleAuthorize,
  handleFrameClick,
  isSelected,
  onResolve,
  testId,
  inlinePreloaderStyle,
}) => {
  const { status, details } = cardState;
  const cardDetails = (details && details.data) || getEmptyJsonLd();
  const testIdWithStatus = testId ? `${testId}-${status}-view` : undefined;
  switch (status) {
    case 'pending':
    case 'resolving':
      return (
        <InlineCardResolvingView
          url={url}
          isSelected={isSelected}
          onClick={handleFrameClick}
          testId={testIdWithStatus}
          inlinePreloaderStyle={inlinePreloaderStyle}
        />
      );
    case 'resolved':
      const resolvedProps = extractInlineProps(
        cardDetails as JsonLd.Data.BaseData,
      );

      if (onResolve) {
        onResolve({
          url,
          title: resolvedProps.title,
        });
      }

      return (
        <InlineCardResolvedView
          {...resolvedProps}
          link={url}
          isSelected={isSelected}
          onClick={handleFrameClick}
          testId={testIdWithStatus}
        />
      );
    case 'unauthorized':
      const provider = extractProvider(cardDetails as JsonLd.Data.BaseData);
      return (
        <InlineCardUnauthorizedView
          icon={provider && provider.icon}
          url={url}
          isSelected={isSelected}
          onClick={handleFrameClick}
          onAuthorise={handleAuthorize}
          testId={testIdWithStatus}
        />
      );
    case 'forbidden':
      const providerForbidden = extractProvider(
        cardDetails as JsonLd.Data.BaseData,
      );
      return (
        <InlineCardForbiddenView
          url={url}
          icon={providerForbidden && providerForbidden.icon}
          isSelected={isSelected}
          onClick={handleFrameClick}
          onAuthorise={handleAuthorize}
          testId={testIdWithStatus}
        />
      );
    case 'not_found':
      const providerNotFound = extractProvider(
        cardDetails as JsonLd.Data.BaseData,
      );
      return (
        <InlineCardErroredView
          url={url}
          icon={providerNotFound && providerNotFound.icon}
          isSelected={isSelected}
          message="Can't find link"
          onClick={handleFrameClick}
          testId={testIdWithStatus || 'inline-card-not-found-view'}
        />
      );
    case 'fallback':
    case 'errored':
      return (
        <CardLinkView
          link={url}
          isSelected={isSelected}
          onClick={handleFrameClick}
          testId={testIdWithStatus || 'inline-card-errored-view'}
        />
      );
  }
};
