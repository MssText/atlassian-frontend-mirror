<!-- API Report Version: 2.3 -->

## API Report File for "@atlaskit/linking-common"

> Do not edit this file. This report is auto-generated using [API Extractor](https://api-extractor.com/).
> [Learn more about API reports](https://hello.atlassian.net/wiki/spaces/UR/pages/1825484529/Package+API+Reports)

### Table of contents

- [Main Entry Types](#main-entry-types)
- [Peer Dependencies](#peer-dependencies)

### Main Entry Types

<!--SECTION START: Main Entry Types-->

```ts
import { AnyAction } from 'redux';
import { JsonLd } from 'json-ld-types';
import { Store } from 'redux';

// @public (undocumented)
export const ACTION_ERROR = 'errored';

// @public (undocumented)
export const ACTION_ERROR_FALLBACK = 'fallback';

// @public (undocumented)
export const ACTION_PENDING = 'pending';

// @public (undocumented)
export const ACTION_PRELOAD = 'preload';

// @public (undocumented)
export const ACTION_RELOADING = 'reloading';

// @public (undocumented)
export const ACTION_RESOLVED = 'resolved';

// @public (undocumented)
export const ACTION_RESOLVING = 'resolving';

// @public (undocumented)
export const ACTION_UPDATE_METADATA_STATUS = 'metadata';

// @public (undocumented)
export class APIError extends Error {
  constructor(
    kind: APIErrorKind,
    hostname: string,
    message: string,
    type?: ErrorType | undefined,
  );
  // (undocumented)
  readonly hostname: string;
  // (undocumented)
  readonly kind: APIErrorKind;
  // (undocumented)
  readonly message: string;
  // (undocumented)
  readonly type?: ErrorType | undefined;
}

// @public (undocumented)
export type APIErrorKind = 'auth' | 'error' | 'fallback' | 'fatal';

// @public (undocumented)
export interface BlockCardAdf {
  // (undocumented)
  attrs: {
    url: string;
  };
  // (undocumented)
  type: 'blockCard';
}

// @public (undocumented)
export interface CardAction<T = JsonLd.Response> extends AnyAction {
  // (undocumented)
  metadataStatus?: MetadataStatus;
  // (undocumented)
  payload?: T;
  // (undocumented)
  type: CardActionType;
  // (undocumented)
  url: string;
}

// @public (undocumented)
export const cardAction: CardBaseActionCreator;

// @public (undocumented)
export type CardActionParams = {
  url: string;
};

// @public (undocumented)
export type CardActionType =
  | 'errored'
  | 'fallback'
  | 'metadata'
  | 'pending'
  | 'reloading'
  | 'resolved'
  | 'resolving';

// @public (undocumented)
export type CardAdf = BlockCardAdf | EmbedCardAdf | InlineCardAdf;

// @public (undocumented)
export type CardAppearance = 'block' | 'embed' | 'inline';

// @public (undocumented)
export type CardBaseActionCreator<T = JsonLd.Response> = (
  type: CardActionType,
  params: CardActionParams,
  payload?: T,
  error?: APIError,
  metadataStatus?: MetadataStatus,
  ignoreStatusCheck?: boolean,
) => CardAction<T>;

// @public (undocumented)
export type CardPlatform = JsonLd.Primitives.Platforms;

// @public (undocumented)
export interface CardState {
  // (undocumented)
  details?: JsonLd.Response;
  // (undocumented)
  error?: APIError;
  // @deprecated (undocumented)
  lastUpdatedAt?: number;
  // (undocumented)
  metadataStatus?: MetadataStatus;
  // (undocumented)
  status: CardType;
}

// @public (undocumented)
export interface CardStore {
  // (undocumented)
  [key: string]: CardState;
}

// @public (undocumented)
export type CardType =
  | 'errored'
  | 'fallback'
  | 'forbidden'
  | 'not_found'
  | 'pending'
  | 'resolved'
  | 'resolving'
  | 'unauthorized';

// @public (undocumented)
export interface EmbedCardAdf {
  // (undocumented)
  attrs: {
    url: string;
    layout: 'wide';
  };
  // (undocumented)
  type: 'embedCard';
}

// @public (undocumented)
export type ErrorType = 'UnexpectedError' | ServerErrorType;

// @public (undocumented)
export const extractPreview: (
  jsonLd: JsonLd.Data.BaseData,
  platform?: JsonLd.Primitives.Platforms | undefined,
) => LinkPreview_2 | undefined;

// @public (undocumented)
export const extractUrlFromLinkJsonLd: (
  link: JsonLd.Primitives.Link | JsonLd.Primitives.Link[],
) => string | undefined;

// @public (undocumented)
export const getUrl: (store: Store<CardStore>, url: string) => CardState;

// @public (undocumented)
export interface InlineCardAdf {
  // (undocumented)
  attrs: {
    url: string;
  };
  // (undocumented)
  type: 'inlineCard';
}

// @public (undocumented)
export type InvocationContext = {
  id: string;
};

// @public (undocumented)
export type InvocationSearchPayload = {
  query: string;
  context?: InvocationContext;
};

// @public (undocumented)
export interface InvokePayload<T> {
  // (undocumented)
  action: T;
  // (undocumented)
  context?: string;
  // (undocumented)
  key: string;
}

// @public (undocumented)
export interface LinkingPlatformFeatureFlags {
  disableLinkPickerPopupPositioningFix?: boolean;
  // (undocumented)
  embedModalSize?: string;
  enableActionableElement?: boolean;
  enableFlexibleBlockCard?: boolean;
  enableLinkPickerForgeTabs?: boolean;
  showAuthTooltip?: string;
  // (undocumented)
  showHoverPreview?: boolean;
  // (undocumented)
  trackIframeDwellEvents?: boolean;
  useLinkPickerAtlassianTabs?: boolean;
  // (undocumented)
  useLinkPickerScrollingTabs?: boolean;
}

// @public @deprecated (undocumented)
export interface LinkPreview {
  // (undocumented)
  aspectRatio?: number;
  // (undocumented)
  content?: string;
  // (undocumented)
  src?: string;
}

// @public (undocumented)
interface LinkPreview_2 {
  // (undocumented)
  aspectRatio?: number;
  // (undocumented)
  content?: string;
  // (undocumented)
  src?: string;
}

// @public (undocumented)
export type MetadataStatus = 'errored' | 'pending' | 'resolved';

// @public
export function promiseDebounce<
  Args extends unknown[],
  ResolveType extends unknown,
>(
  cb: (...args: Args) => Promise<ResolveType>,
  time: number,
): (...args: Args) => Promise<ResolveType>;

// @public (undocumented)
export interface ServerActionOpts {
  // (undocumented)
  payload: ServerActionPayload;
  // (undocumented)
  type: string;
}

// @public (undocumented)
export interface ServerActionPayload {
  // (undocumented)
  context?: JsonLd.Primitives.Link | JsonLd.Primitives.Object;
  // (undocumented)
  id: string;
}

// @public (undocumented)
export type ServerErrorType =
  | 'InternalServerError'
  | 'ResolveAuthError'
  | 'ResolveBadRequestError'
  | 'ResolveFailedError'
  | 'ResolveRateLimitError'
  | 'ResolveTimeoutError'
  | 'ResolveUnsupportedError'
  | 'SearchAuthError'
  | 'SearchBadRequestError'
  | 'SearchFailedError'
  | 'SearchRateLimitError'
  | 'SearchTimeoutError'
  | 'SearchUnsupportedError';

// (No @packageDocumentation comment for this package)
```

<!--SECTION END: Main Entry Types-->

### Peer Dependencies

<!--SECTION START: Peer Dependencies-->

```json
{
  "react": "^16.8.0"
}
```

<!--SECTION END: Peer Dependencies-->
