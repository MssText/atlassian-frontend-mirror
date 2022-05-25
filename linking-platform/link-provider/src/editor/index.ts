// import setimmediate to temporary fix dataloader 2.0.0 bug
// @see https://github.com/graphql/dataloader/issues/249
import 'setimmediate';
import DataLoader from 'dataloader';
import { CardAdf, CardAppearance } from '@atlaskit/linking-common';
import {
  CardProvider,
  ORSCheckResponse,
  ORSProvidersResponse,
  ProviderPattern,
} from './types';
import { Transformer } from './transformer';

import { getBaseUrl, getResolverUrl } from '../client/utils/environments';
import { EnvironmentsKeys } from '../client/types';
import * as api from '../client/api';

const BATCH_WAIT_TIME = 50;

export class EditorCardProvider implements CardProvider {
  private baseUrl: string;
  private resolverUrl: string;
  private patterns?: ProviderPattern[];
  private requestHeaders: HeadersInit;
  private transformer: Transformer;
  private patternLoader: DataLoader<string, ProviderPattern[] | undefined>;

  constructor(envKey?: EnvironmentsKeys) {
    this.baseUrl = getBaseUrl(envKey);
    this.resolverUrl = getResolverUrl(envKey);
    this.transformer = new Transformer();
    this.requestHeaders = {
      Origin: this.baseUrl,
    };
    this.patternLoader = new DataLoader(keys => this.batchPatterns(keys), {
      batchScheduleFn: callback => setTimeout(callback, BATCH_WAIT_TIME),
    });
  }

  private async batchPatterns(
    keys: ReadonlyArray<string>,
  ): Promise<Array<ProviderPattern[] | undefined>> {
    // EDM-2205: Batch requests in the case that user paste multiple links at
    // once. This is so that only one /providers is being called.
    const patterns = await this.fetchPatterns();
    return keys.map(() => patterns);
  }

  private async check(resourceUrl: string): Promise<boolean | undefined> {
    try {
      const endpoint = `${this.resolverUrl}/check`;
      const response = await api.request<ORSCheckResponse>(
        'post',
        endpoint,
        {
          resourceUrl,
        },
        this.requestHeaders,
      );
      return response.isSupported;
    } catch (err) {
      // eslint-disable-next-line
      console.error('failed to fetch /check', err);
      return undefined;
    }
  }

  private async fetchPatterns(): Promise<ProviderPattern[] | undefined> {
    try {
      const endpoint = `${this.resolverUrl}/providers`;
      const response = await api.request<ORSProvidersResponse>(
        'post',
        endpoint,
        undefined,
        this.requestHeaders,
      );

      return response.providers.reduce(
        (allSources: ProviderPattern[], provider) => {
          return allSources.concat(provider.patterns);
        },
        [],
      );
    } catch (err) {
      // eslint-disable-next-line
      console.error('failed to fetch /providers', err);
      return undefined;
    }
  }

  async findPattern(url: string): Promise<boolean> {
    return !!(await this.findPatternData(url));
  }

  private async findPatternData(
    url: string,
  ): Promise<ProviderPattern | undefined> {
    if (!this.patterns) {
      this.patterns = await this.patternLoader.load('providers');
    }
    return this.patterns?.find(pattern => url.match(pattern.source));
  }

  async resolve(url: string, appearance: CardAppearance): Promise<CardAdf> {
    try {
      const matchedProviderPattern = await this.findPatternData(url);
      let isSupported = !!matchedProviderPattern || (await this.check(url));
      if (isSupported) {
        return this.transformer.toAdf(
          url,
          matchedProviderPattern?.defaultView || appearance,
        );
      }
    } catch (e) {
      // eslint-disable-next-line
      console.warn(
        `Error when trying to check Smart Card url "${url} - ${e.prototype.name} ${e.message}`,
        e,
      );
    }

    return Promise.reject(undefined);
  }
}

export const editorCardProvider = new EditorCardProvider();
export type { CardProvider, ORSCheckResponse } from './types';
