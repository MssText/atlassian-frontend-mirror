<!-- API Report Version: 2.3 -->

## API Report File for "@atlaskit/task-decision"

> Do not edit this file. This report is auto-generated using [API Extractor](https://api-extractor.com/).
> [Learn more about API reports](https://hello.atlassian.net/wiki/spaces/UR/pages/1825484529/Package+API+Reports)

### Table of contents

- [Main Entry Types](#main-entry-types)
- [Peer Dependencies](#peer-dependencies)

### Main Entry Types

<!--SECTION START: Main Entry Types-->

```ts
/// <reference types="react" />

import { jsx } from '@emotion/react';
import { PureComponent } from 'react';
import { default as React_2 } from 'react';
import { ReactNode } from 'react';
import { ServiceConfig } from '@atlaskit/util-service-support';
import { WithAnalyticsEventsProps } from '@atlaskit/analytics-next';

// @public (undocumented)
export type Appearance = 'inline';

// @public
export type ARI = string;

// @public (undocumented)
export type AVI = string;

// @public (undocumented)
export interface BaseItem<S> extends ObjectKey {
  // (undocumented)
  lastUpdateDate: Date;
  // (undocumented)
  state: S;
  // (undocumented)
  type: DecisionType | TaskType;
}

// @public (undocumented)
export interface ContentRef {
  // (undocumented)
  (ref: HTMLElement | null): void;
}

// @public (undocumented)
export type Cursor = string;

// @public (undocumented)
export interface Decision extends BaseItem<DecisionState> {
  // (undocumented)
  creationDate?: Date;
  // (undocumented)
  creator?: UserId;
  // (undocumented)
  lastUpdateDate: Date;
  // (undocumented)
  lastUpdater?: UserId;
  // (undocumented)
  participants?: UserId[];
  // (undocumented)
  status: DecisionStatus;
  // (undocumented)
  type: DecisionType;
}

// @public (undocumented)
export const DecisionItem: ({
  appearance,
  children,
  contentRef,
  placeholder,
  showPlaceholder,
  dataAttributes,
}: Props) => jsx.JSX.Element;

// @public (undocumented)
export class DecisionList extends PureComponent<Props_2, {}> {
  // (undocumented)
  render(): jsx.JSX.Element | null;
}

// @public (undocumented)
export type DecisionState = 'DECIDED';

// @public (undocumented)
export type DecisionStatus = 'CREATED';

// @public (undocumented)
export type DecisionType = 'DECISION';

// @public (undocumented)
export type Handler = (state: DecisionState | TaskState) => void;

// @public (undocumented)
export type Item = Decision | Task;

// @public (undocumented)
export interface Meta {
  // (undocumented)
  cursor?: string;
}

// @public (undocumented)
export interface ObjectKey {
  // (undocumented)
  containerAri?: string;
  // (undocumented)
  localId: string;
  // (undocumented)
  objectAri: string;
}

// @public (undocumented)
export interface OnUpdate<T> {
  // (undocumented)
  (allDecisions: T[], newDecisions: T[]): void;
}

// @public (undocumented)
interface Props {
  // (undocumented)
  appearance?: Appearance;
  // (undocumented)
  children?: any;
  // (undocumented)
  contentRef?: ContentRef;
  // (undocumented)
  dataAttributes?: {
    [key: string]: number | string;
  };
  // (undocumented)
  placeholder?: string;
  // (undocumented)
  showPlaceholder?: boolean;
}

// @public (undocumented)
interface Props_2 {
  // (undocumented)
  children?: ReactNode;
}

// @public (undocumented)
interface Props_3 {
  // (undocumented)
  appearance?: Appearance;
  // (undocumented)
  children?: any;
  // (undocumented)
  contentRef?: ContentRef;
  // (undocumented)
  dataAttributes?: {
    [key: string]: number | string;
  };
  // (undocumented)
  disabled?: boolean;
  // (undocumented)
  isDone?: boolean;
  // (undocumented)
  isRenderer?: boolean;
  // (undocumented)
  objectAri?: string;
  // (undocumented)
  onChange?: (taskId: string, isChecked: boolean) => void;
  // (undocumented)
  placeholder?: string;
  // (undocumented)
  showPlaceholder?: boolean;
  // (undocumented)
  taskDecisionProvider?: Promise<TaskDecisionProvider>;
  // (undocumented)
  taskId: string;
}

// @public (undocumented)
interface Props_4 {
  // (undocumented)
  appearance?: Appearance;
  // (undocumented)
  children?: any;
  // (undocumented)
  contentRef?: ContentRef;
  // (undocumented)
  dataAttributes?: {
    [key: string]: number | string;
  };
  // (undocumented)
  disabled?: boolean;
  // (undocumented)
  isDone?: boolean;
  // (undocumented)
  isRenderer?: boolean;
  // (undocumented)
  onChange?: (taskId: string, isChecked: boolean) => void;
  // (undocumented)
  placeholder?: string;
  // (undocumented)
  showPlaceholder?: boolean;
  // (undocumented)
  taskId: string;
}

// @public (undocumented)
interface Props_5 {
  // (undocumented)
  children?: ReactNode;
  // (undocumented)
  listId?: string;
}

// @public (undocumented)
export interface PubSubClient {
  // (undocumented)
  join(aris: ARI[]): Promise<PubSubClient>;
  // (undocumented)
  leave(aris: ARI[]): Promise<PubSubClient>;
  // (undocumented)
  off(eventAvi: string, listener: PubSubOnEvent): PubSubClient;
  // (undocumented)
  on(eventAvi: string, listener: PubSubOnEvent): PubSubClient;
}

// @public (undocumented)
export interface PubSubOnEvent<T = any> {
  // (undocumented)
  (event: string, data: T): void;
}

// @public (undocumented)
export enum PubSubSpecialEventType {
  // (undocumented)
  CONNECTED = 'CONNECTED',
  // (undocumented)
  ERROR = 'ERROR',
  // (undocumented)
  RECONNECT = 'RECONNECT',
}

// @public (undocumented)
export interface RecentUpdateContext {
  // (undocumented)
  localId?: string;
  // (undocumented)
  objectAri: string;
}

// @public (undocumented)
export type RecentUpdatesId = string;

// @public
export interface RecentUpdatesListener {
  id(id: RecentUpdatesId): void;
  recentUpdates(updateContext: RecentUpdateContext): void;
}

// @public (undocumented)
export interface RenderDocument {
  // (undocumented)
  (document: any, rendererContext?: RendererContext): JSX.Element;
}

// @public
export interface RendererContext {
  // (undocumented)
  containerAri?: string;
  // (undocumented)
  objectAri: string;
}

// @public (undocumented)
export class ResourcedTaskItem extends PureComponent<Props_3, State> {
  constructor(props: Props_3);
  // (undocumented)
  componentDidMount(): void;
  // (undocumented)
  componentWillUnmount(): void;
  // (undocumented)
  static defaultProps: Partial<Props_3>;
  // (undocumented)
  render(): JSX.Element;
  // (undocumented)
  UNSAFE_componentWillReceiveProps(nextProps: Props_3): void;
}

// @public (undocumented)
export interface ServiceDecision {
  // (undocumented)
  creationDate?: string;
  // (undocumented)
  creatorId?: UserId;
  // (undocumented)
  lastUpdateDate: string;
  // (undocumented)
  lastUpdaterId?: UserId;
  // (undocumented)
  localId: string;
  // (undocumented)
  objectAri: string;
  // (undocumented)
  participants?: UserId[];
  // (undocumented)
  state?: DecisionState;
  // (undocumented)
  status: DecisionStatus;
  // (undocumented)
  type: DecisionType;
}

// @public (undocumented)
export interface ServiceDecisionResponse {
  // (undocumented)
  decisions: ServiceDecision[];
  // (undocumented)
  meta: Meta;
}

// @public (undocumented)
export type ServiceItem = ServiceDecision | ServiceTask;

// @public (undocumented)
export interface ServiceTask {
  // (undocumented)
  creationDate?: string;
  // (undocumented)
  creatorId?: UserId;
  // (undocumented)
  lastUpdateDate: string;
  // (undocumented)
  lastUpdaterId?: UserId;
  // (undocumented)
  localId: string;
  // (undocumented)
  objectAri: string;
  // (undocumented)
  parentLocalId?: string;
  // (undocumented)
  participants?: UserId[];
  // (undocumented)
  position: number;
  // (undocumented)
  state: TaskState;
  // (undocumented)
  type: TaskType;
}

// @public (undocumented)
export interface ServiceTaskState {
  // (undocumented)
  lastUpdateDate: string;
  // (undocumented)
  localId: string;
  // (undocumented)
  objectAri: string;
  // (undocumented)
  state: TaskState;
}

// @public (undocumented)
interface State {
  // (undocumented)
  isDone?: boolean;
}

// @public (undocumented)
export interface Task extends BaseItem<TaskState> {
  // (undocumented)
  creationDate?: Date;
  // (undocumented)
  creator?: UserId;
  // (undocumented)
  lastUpdateDate: Date;
  // (undocumented)
  lastUpdater?: UserId;
  // (undocumented)
  parentLocalId?: string;
  // (undocumented)
  participants?: UserId[];
  // (undocumented)
  position?: number;
  // (undocumented)
  type: TaskType;
}

// @public (undocumented)
export interface TaskDecisionProvider {
  // (undocumented)
  notifyRecentUpdates(updateContext: RecentUpdateContext): void;
  // (undocumented)
  subscribe(
    objectKey: ObjectKey,
    handler: Handler,
    item?: BaseItem<DecisionState | TaskState>,
  ): void;
  // (undocumented)
  toggleTask(objectKey: ObjectKey, state: TaskState): Promise<TaskState>;
  // (undocumented)
  unsubscribe(objectKey: ObjectKey, handler: Handler): void;
  // (undocumented)
  unsubscribeRecentUpdates(id: RecentUpdatesId): void;
}

// @public (undocumented)
export class TaskDecisionResource implements TaskDecisionProvider {
  constructor(serviceConfig: TaskDecisionResourceConfig);
  destroy(): void;
  // (undocumented)
  notifyRecentUpdates(recentUpdateContext: RecentUpdateContext): void;
  // (undocumented)
  subscribe(
    objectKey: ObjectKey,
    handler: Handler,
    item?: BaseItem<DecisionState | TaskState>,
  ): void;
  // (undocumented)
  toggleTask(objectKey: ObjectKey, state: TaskState): Promise<TaskState>;
  // (undocumented)
  unsubscribe(objectKey: ObjectKey, handler: Handler): void;
  // (undocumented)
  unsubscribeRecentUpdates(id: RecentUpdatesId): void;
}

// @public (undocumented)
export interface TaskDecisionResourceConfig extends ServiceConfig {
  disableServiceHydration?: boolean;
  // (undocumented)
  pubSubClient?: PubSubClient;
}

// @public (undocumented)
export const TaskItem: React_2.ForwardRefExoticComponent<
  Omit<Props_4 & WithAnalyticsEventsProps, keyof WithAnalyticsEventsProps> &
    React_2.RefAttributes<any>
>;

// @public (undocumented)
export class TaskList extends PureComponent<Props_5, {}> {
  // (undocumented)
  render(): jsx.JSX.Element | null;
}

// @public (undocumented)
export type TaskState = 'DONE' | 'TODO';

// @public (undocumented)
export type TaskType = 'TASK';

// @public (undocumented)
export type UserId = string;

// (No @packageDocumentation comment for this package)
```

<!--SECTION END: Main Entry Types-->

### Peer Dependencies

<!--SECTION START: Peer Dependencies-->

```json
{
  "react": "^16.8.0",
  "react-dom": "^16.8.0",
  "url-search-params": "^0.10.0"
}
```

<!--SECTION END: Peer Dependencies-->
