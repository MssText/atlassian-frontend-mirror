import { CardAppearance } from '@atlaskit/smart-card';
import { AnnotationId, AnnotationTypes } from '@atlaskit/adf-schema';
import { toNativeBridge } from './editor/web-to-native';
import {
  PromiseName,
  GetAuthPayload,
  GetConfigPayload,
  NativeFetchPayload,
  GetAccountIdPayload,
  GetResolvedLinkPayload,
  GetLinkResolvePayload,
  SelectionPayload,
  GetAnnotationStatesPayload,
} from './types';

const pendingPromises: Map<string, Holder<any>> = new Map<
  string,
  Holder<any>
>();
export let counter: number = 0;

interface Holder<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (err?: Error) => void;
}

export interface SubmitPromiseToNative<T> {
  submit(): Promise<T>;
}

export function createPromise(
  name: 'onSelection',
  args: SelectionPayload,
): SubmitPromiseToNative<void>;
export function createPromise(
  name: 'getAuth',
  args: string,
): SubmitPromiseToNative<GetAuthPayload>;
export function createPromise(
  name: 'getConfig',
): SubmitPromiseToNative<GetConfigPayload>;
export function createPromise(
  name: 'nativeFetch',
  args: { url: string; options?: RequestInit },
): SubmitPromiseToNative<NativeFetchPayload>;
export function createPromise(
  name: 'getAccountId',
): SubmitPromiseToNative<GetAccountIdPayload>;
export function createPromise(
  name: 'getResolvedLink',
  args: { url: string },
): SubmitPromiseToNative<GetResolvedLinkPayload>;
export function createPromise(
  name: 'getLinkResolve',
  args: { url: string; appearance: CardAppearance },
): SubmitPromiseToNative<GetLinkResolvePayload>;
export function createPromise(
  name: 'getAnnotationStates',
  args: {
    annotationIds: AnnotationId[];
    annotationType: AnnotationTypes;
  },
): SubmitPromiseToNative<GetAnnotationStatesPayload>;
export function createPromise<T>(
  name: PromiseName,
  rawArgs?: unknown,
): SubmitPromiseToNative<T> {
  const holder: Holder<T> = createHolder();
  const uuid = counter++ + '';
  pendingPromises.set(uuid, holder);

  const payload =
    typeof rawArgs === 'string' ? rawArgs : JSON.stringify(rawArgs);

  const args: Readonly<[PromiseName, string, string?]> =
    typeof rawArgs === 'undefined' ? [name, uuid] : [name, uuid, payload];

  return {
    async submit(): Promise<T> {
      toNativeBridge.submitPromise(...args);
      try {
        return await holder.promise;
      } finally {
        pendingPromises.delete(uuid);
      }
    },
  };
}

function createHolder<T>(): Holder<T> {
  const holder: Partial<Holder<T>> = {};

  holder.promise = new Promise<T>((resolve, reject) => {
    holder.resolve = data => resolve(data);
    holder.reject = err => reject(err);
  });

  return holder as Holder<T>;
}

export function resolvePromise<T>(uuid: string, resolution: T) {
  const holder: Holder<T> | undefined = pendingPromises.get(uuid);
  if (holder) {
    holder.resolve(resolution);
  }
}

export function rejectPromise<T>(uuid: string, err?: Error) {
  const holder: Holder<T> | undefined = pendingPromises.get(uuid);
  if (holder) {
    holder.reject(err);
  }
}

// expose this function for testing
export function setCounter(value: number) {
  counter = value;
}
