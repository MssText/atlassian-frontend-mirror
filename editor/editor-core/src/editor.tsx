/** @jsx jsx */
import React, { Fragment } from 'react';
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { EditorView } from 'prosemirror-view';
import type { IntlShape } from 'react-intl-next';
import memoizeOne from 'memoize-one';
import uuid from 'uuid/v4';
import { name, version } from './version-wrapper';
import { combineExtensionProviders } from '@atlaskit/editor-common/extensions';
import type { ExtensionProvider } from '@atlaskit/editor-common/extensions';
import { ProviderFactory } from '@atlaskit/editor-common/provider-factory';
import {
  BaseTheme,
  WithCreateAnalyticsEvent,
  WidthProvider,
} from '@atlaskit/editor-common/ui';
import {
  getAnalyticsAppearance,
  startMeasure,
  stopMeasure,
  clearMeasure,
  measureTTI,
  getTTISeverity,
} from '@atlaskit/editor-common/utils';
import { Transformer } from '@atlaskit/editor-common/types';

import { EditorExperience, ExperienceStore } from '@atlaskit/editor-common/ufo';
import { akEditorFullPageDefaultFontSize } from '@atlaskit/editor-shared-styles';
import { FabricEditorAnalyticsContext } from '@atlaskit/analytics-namespaced-context';
import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';

import { getUiComponent } from './create-editor';
import EditorActions from './actions';
import { EditorProps, ExtensionProvidersProp } from './types/editor-props';
import { ReactEditorView } from './create-editor';
import { EventDispatcher } from './event-dispatcher';
import EditorContext from './ui/EditorContext';
import {
  PortalProviderWithThemeProviders,
  PortalRenderer,
} from './ui/PortalProvider';
import { nextMajorVersion } from './version-wrapper';
import { ContextAdapter } from './nodeviews/context-adapter';
import measurements from './utils/performance/measure-enum';
import {
  combineQuickInsertProviders,
  extensionProviderToQuickInsertProvider,
} from './utils/extensions';
import {
  fireAnalyticsEvent,
  EVENT_TYPE,
  ACTION_SUBJECT,
  ACTION,
  FireAnalyticsCallback,
  AnalyticsEventPayload,
} from './plugins/analytics';
import ErrorBoundary from './create-editor/ErrorBoundary';
import {
  QuickInsertProvider,
  QuickInsertOptions,
} from './plugins/quick-insert/types';
import { createFeatureFlagsFromProps } from './plugins/feature-flags-context/feature-flags-from-props';
import { RenderTracking } from './utils/performance/components/RenderTracking';

export type {
  AllowedBlockTypes,
  Command,
  CommandDispatch,
  DomAtPos,
  EditorAppearance,
  EditorAppearanceComponentProps,
  EditorConfig,
  EditorInstance,
  EditorPlugin,
  EditorProps,
  ExtensionProvidersProp,
  ExtensionConfig,
  FeedbackInfo,
  MarkConfig,
  MessageDescriptor,
  NodeConfig,
  NodeViewConfig,
  PMPlugin,
  PMPluginCreateConfig,
  PMPluginFactory,
  PMPluginFactoryParams,
  PluginsOptions,
  ReactComponents,
  ToolbarUIComponentFactory,
  ToolbarUiComponentFactoryParams,
  UIComponentFactory,
  UiComponentFactoryParams,
} from './types';

type Context = {
  editorActions?: EditorActions;
  intl: IntlShape;
};

type State = {
  extensionProvider?: ExtensionProvider;
  quickInsertProvider?: Promise<QuickInsertProvider>;
};

const fullHeight = css`
  height: 100%;
`;

export default class Editor extends React.Component<EditorProps, State> {
  static defaultProps: EditorProps = {
    appearance: 'comment',
    disabled: false,
    extensionHandlers: {},
    allowHelpDialog: true,
    allowNewInsertionBehaviour: true,
    quickInsert: true,
  };

  static propTypes = {
    minHeight: ({ appearance, minHeight }: EditorProps) => {
      if (
        minHeight &&
        appearance &&
        !['comment', 'chromeless'].includes(appearance)
      ) {
        return new Error(
          'minHeight only supports editor appearance chromeless and comment',
        );
      }
      return null;
    },
  };

  static contextTypes = {
    editorActions: PropTypes.object,
  };

  private providerFactory: ProviderFactory;
  private editorActions: EditorActions;
  private createAnalyticsEvent?: CreateUIAnalyticsEvent;
  private editorSessionId: string;
  private experienceStore?: ExperienceStore;
  private startTime?: number;

  constructor(props: EditorProps, context: Context) {
    super(props);

    this.providerFactory = new ProviderFactory();
    this.deprecationWarnings(props);
    this.onEditorCreated = this.onEditorCreated.bind(this);
    this.onEditorDestroyed = this.onEditorDestroyed.bind(this);
    this.editorActions = (context || {}).editorActions || new EditorActions();
    this.trackEditorActions(this.editorActions, props);
    this.editorSessionId = uuid();
    this.startTime = performance.now();

    startMeasure(measurements.EDITOR_MOUNTED);
    if (
      props.performanceTracking?.ttiTracking?.enabled ||
      props.featureFlags?.ufo
    ) {
      measureTTI(
        (tti, ttiFromInvocation, canceled) => {
          if (
            props.performanceTracking?.ttiTracking?.enabled &&
            this.createAnalyticsEvent
          ) {
            const ttiEvent: { payload: AnalyticsEventPayload } = {
              payload: {
                action: ACTION.EDITOR_TTI,
                actionSubject: ACTION_SUBJECT.EDITOR,
                attributes: { tti, ttiFromInvocation, canceled },
                eventType: EVENT_TYPE.OPERATIONAL,
              },
            };
            if (props.performanceTracking!.ttiTracking?.trackSeverity) {
              const {
                ttiSeverityNormalThreshold,
                ttiSeverityDegradedThreshold,
                ttiFromInvocationSeverityNormalThreshold,
                ttiFromInvocationSeverityDegradedThreshold,
              } = props.performanceTracking!.ttiTracking;
              const { ttiSeverity, ttiFromInvocationSeverity } = getTTISeverity(
                tti,
                ttiFromInvocation,
                ttiSeverityNormalThreshold,
                ttiSeverityDegradedThreshold,
                ttiFromInvocationSeverityNormalThreshold,
                ttiFromInvocationSeverityDegradedThreshold,
              );
              ttiEvent.payload.attributes.ttiSeverity = ttiSeverity;
              ttiEvent.payload.attributes.ttiFromInvocationSeverity =
                ttiFromInvocationSeverity;
            }
            fireAnalyticsEvent(this.createAnalyticsEvent)(ttiEvent);
          }

          if (props.featureFlags?.ufo) {
            this.experienceStore?.mark(
              EditorExperience.loadEditor,
              ACTION.EDITOR_TTI,
              tti,
            );
            this.experienceStore?.success(EditorExperience.loadEditor);
          }
        },
        props.performanceTracking?.ttiTracking?.ttiIdleThreshold,
        props.performanceTracking?.ttiTracking?.ttiCancelTimeout,
      );
    }

    const extensionProvider = this.prepareExtensionProvider(
      props.extensionProviders,
    );

    const quickInsertProvider = this.prepareQuickInsertProvider(
      extensionProvider,
      props.quickInsert,
    );

    this.state = {
      extensionProvider,
      quickInsertProvider,
    };
  }

  componentDidMount() {
    stopMeasure(
      measurements.EDITOR_MOUNTED,
      this.sendDurationAnalytics(ACTION.EDITOR_MOUNTED),
    );
    this.handleProviders(this.props);
  }

  componentDidUpdate(prevProps: EditorProps) {
    const { extensionProviders, quickInsert } = this.props;
    if (
      (extensionProviders &&
        extensionProviders !== prevProps.extensionProviders) ||
      // Though this will introduce some performance regression related to quick insert
      // loading but we can remove it soon when Forge will move to new API.
      // quickInsert={Promise.resolve(consumerQuickInsert)} is one of the main reason behind this performance issue.
      (quickInsert && quickInsert !== prevProps.quickInsert)
    ) {
      const extensionProvider =
        this.prepareExtensionProvider(extensionProviders);
      const quickInsertProvider = this.prepareQuickInsertProvider(
        extensionProvider,
        quickInsert,
      );

      this.setState(
        {
          extensionProvider,
          quickInsertProvider,
        },
        () => this.handleProviders(this.props),
      );
      return;
    }
    this.handleProviders(this.props);
  }

  componentWillUnmount() {
    this.unregisterEditorFromActions();
    this.providerFactory.destroy();
    clearMeasure(measurements.EDITOR_MOUNTED);
    this.props?.performanceTracking?.onEditorReadyCallbackTracking?.enabled &&
      clearMeasure(measurements.ON_EDITOR_READY_CALLBACK);

    if (this.props.featureFlags?.ufo) {
      this.experienceStore?.abortAll({ reason: 'editor component unmounted' });
    }
  }

  trackEditorActions(
    editorActions: EditorActions & {
      _contentRetrievalTracking?: {
        getValueTracked: boolean;
        samplingCounters: { success: number; failure: number };
      };
    },
    props: EditorProps,
  ) {
    if (props?.performanceTracking?.contentRetrievalTracking?.enabled) {
      const DEFAULT_SAMPLING_RATE = 100;
      const getValue = editorActions.getValue.bind(editorActions);
      if (!editorActions._contentRetrievalTracking) {
        editorActions._contentRetrievalTracking = {
          samplingCounters: {
            success: 1,
            failure: 1,
          },
          getValueTracked: false,
        };
      }
      const {
        _contentRetrievalTracking: { samplingCounters, getValueTracked },
      } = editorActions;

      if (!getValueTracked) {
        const getValueWithTracking = async () => {
          try {
            const value = await getValue();
            if (
              samplingCounters.success ===
              (props?.performanceTracking?.contentRetrievalTracking
                ?.successSamplingRate ?? DEFAULT_SAMPLING_RATE)
            ) {
              this.handleAnalyticsEvent({
                payload: {
                  action: ACTION.EDITOR_CONTENT_RETRIEVAL_PERFORMED,
                  actionSubject: ACTION_SUBJECT.EDITOR,
                  attributes: {
                    success: true,
                  },
                  eventType: EVENT_TYPE.OPERATIONAL,
                },
              });
              samplingCounters.success = 0;
            }
            samplingCounters.success++;
            return value;
          } catch (err: any) {
            if (
              samplingCounters.failure ===
              (props?.performanceTracking?.contentRetrievalTracking
                ?.failureSamplingRate ?? DEFAULT_SAMPLING_RATE)
            ) {
              this.handleAnalyticsEvent({
                payload: {
                  action: ACTION.EDITOR_CONTENT_RETRIEVAL_PERFORMED,
                  actionSubject: ACTION_SUBJECT.EDITOR,
                  attributes: {
                    success: false,
                    errorInfo: err.toString(),
                    errorStack: props?.performanceTracking
                      ?.contentRetrievalTracking?.reportErrorStack
                      ? err.stack
                      : undefined,
                  },
                  eventType: EVENT_TYPE.OPERATIONAL,
                },
              });
              samplingCounters.failure = 0;
            }
            samplingCounters.failure++;
            throw err;
          }
        };
        editorActions.getValue = getValueWithTracking;
        editorActions._contentRetrievalTracking.getValueTracked = true;
      }
    }
    return editorActions;
  }

  prepareExtensionProvider = memoizeOne(
    (extensionProviders?: ExtensionProvidersProp) => {
      if (!extensionProviders) {
        return;
      }

      if (typeof extensionProviders === 'function') {
        return combineExtensionProviders(
          extensionProviders(this.editorActions),
        );
      }

      return combineExtensionProviders(extensionProviders);
    },
  );

  prepareQuickInsertProvider = (
    extensionProvider?: ExtensionProvider,
    quickInsert?: QuickInsertOptions,
  ) => {
    const quickInsertProvider =
      quickInsert && typeof quickInsert !== 'boolean' && quickInsert.provider;

    const extensionQuickInsertProvider =
      extensionProvider &&
      extensionProviderToQuickInsertProvider(
        extensionProvider,
        this.editorActions,
        this.createAnalyticsEvent,
      );

    return quickInsertProvider && extensionQuickInsertProvider
      ? combineQuickInsertProviders([
          quickInsertProvider,
          extensionQuickInsertProvider,
        ])
      : quickInsertProvider || extensionQuickInsertProvider;
  };

  onEditorCreated(instance: {
    view: EditorView;
    eventDispatcher: EventDispatcher;
    transformer?: Transformer<string>;
  }) {
    this.registerEditorForActions(
      instance.view,
      instance.eventDispatcher,
      instance.transformer,
    );

    if (this.props.featureFlags?.ufo) {
      this.experienceStore = ExperienceStore.getInstance(instance.view);
      this.experienceStore.start(EditorExperience.loadEditor, this.startTime);
    }

    if (this.props.onEditorReady) {
      const measureEditorReady =
        this.props?.performanceTracking?.onEditorReadyCallbackTracking
          ?.enabled || this.props.featureFlags?.ufo;

      measureEditorReady && startMeasure(measurements.ON_EDITOR_READY_CALLBACK);

      this.props.onEditorReady(this.editorActions);

      measureEditorReady &&
        stopMeasure(
          measurements.ON_EDITOR_READY_CALLBACK,
          this.sendDurationAnalytics(ACTION.ON_EDITOR_READY_CALLBACK),
        );
    }
  }

  private sendDurationAnalytics(
    action: ACTION.EDITOR_MOUNTED | ACTION.ON_EDITOR_READY_CALLBACK,
  ) {
    return async (duration: number, startTime: number) => {
      const contextIdentifier = await this.props.contextIdentifierProvider;
      const objectId = contextIdentifier?.objectId;

      if (this.createAnalyticsEvent) {
        fireAnalyticsEvent(this.createAnalyticsEvent)({
          payload: {
            action,
            actionSubject: ACTION_SUBJECT.EDITOR,
            attributes: {
              duration,
              startTime,
              objectId,
            },
            eventType: EVENT_TYPE.OPERATIONAL,
          },
        });
      }

      if (this.props.featureFlags?.ufo) {
        this.experienceStore?.mark(
          EditorExperience.loadEditor,
          action,
          startTime + duration,
        );
        this.experienceStore?.addMetadata(EditorExperience.loadEditor, {
          objectId,
        });
      }
    };
  }

  private deprecationWarnings(props: EditorProps) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const nextVersion = nextMajorVersion();
    const deprecatedProperties = {
      allowTasksAndDecisions: {
        message:
          'To allow tasks and decisions use taskDecisionProvider – <Editor taskDecisionProvider={{ provider }} />',
        type: 'removed',
      },

      allowConfluenceInlineComment: {
        message:
          'To integrate inline comments use experimental annotationProvider – <Editor annotationProviders={{ provider }} />',
        type: 'removed',
      },

      smartLinks: {
        message:
          'To use smartLinks, pass the same object into the smartlinks key of linking - <Editor linking={{ smartLinks: {existing object} }}.',
        type: 'removed',
      },
    };

    (
      Object.keys(deprecatedProperties) as Array<
        keyof typeof deprecatedProperties
      >
    ).forEach((property) => {
      if (props.hasOwnProperty(property)) {
        const meta: { type?: string; message?: string } =
          deprecatedProperties[property];
        const type = meta.type || 'enabled by default';

        // eslint-disable-next-line no-console
        console.warn(
          `${property} property is deprecated. ${
            meta.message || ''
          } [Will be ${type} in editor-core@${nextVersion}]`,
        );
      }
    });

    if (
      props.hasOwnProperty('allowTables') &&
      typeof props.allowTables !== 'boolean' &&
      (!props.allowTables || !props.allowTables.advanced)
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `Advanced table options are deprecated (except isHeaderRowRequired) to continue using advanced table features use - <Editor allowTables={{ advanced: true }} /> [Will be changed in editor-core@${nextVersion}]`,
      );
    }

    if (
      props.hasOwnProperty('allowTextColor') &&
      typeof props.allowTextColor !== 'boolean' &&
      props?.allowTextColor?.allowMoreTextColors !== undefined
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `"allowMoreTextColors" field of "allowTextColor" property is deprecated. It will be removedin editor-core@${nextVersion}. The color palette now shows more colors by default.`,
      );
    }
  }

  onEditorDestroyed(_instance: {
    view: EditorView;
    transformer?: Transformer<string>;
  }) {
    this.unregisterEditorFromActions();

    if (this.props.onDestroy) {
      this.props.onDestroy();
    }
  }

  private registerEditorForActions(
    editorView: EditorView,
    eventDispatcher: EventDispatcher,
    contentTransformer?: Transformer<string>,
  ) {
    this.editorActions._privateRegisterEditor(
      editorView,
      eventDispatcher,
      contentTransformer,
    );
  }

  private unregisterEditorFromActions() {
    if (this.editorActions) {
      this.editorActions._privateUnregisterEditor();
    }
  }

  private handleProviders(props: EditorProps) {
    const {
      emojiProvider,
      mentionProvider,
      taskDecisionProvider,
      contextIdentifierProvider,
      collabEditProvider,
      activityProvider,
      presenceProvider,
      macroProvider,
      legacyImageUploadProvider,
      media,
      collabEdit,
      autoformattingProvider,
      searchProvider,
      UNSAFE_cards,
      smartLinks,
      linking,
    } = props;

    const { extensionProvider, quickInsertProvider } = this.state;

    this.providerFactory.setProvider('emojiProvider', emojiProvider);
    this.providerFactory.setProvider('mentionProvider', mentionProvider);
    this.providerFactory.setProvider(
      'taskDecisionProvider',
      taskDecisionProvider,
    );
    this.providerFactory.setProvider(
      'contextIdentifierProvider',
      contextIdentifierProvider,
    );

    this.providerFactory.setProvider('mediaProvider', media && media.provider);
    this.providerFactory.setProvider(
      'imageUploadProvider',
      legacyImageUploadProvider,
    );
    this.providerFactory.setProvider(
      'collabEditProvider',
      collabEdit && collabEdit.provider
        ? collabEdit.provider
        : collabEditProvider,
    );
    this.providerFactory.setProvider('activityProvider', activityProvider);
    this.providerFactory.setProvider('searchProvider', searchProvider);
    this.providerFactory.setProvider('presenceProvider', presenceProvider);
    this.providerFactory.setProvider('macroProvider', macroProvider);

    const cardProvider =
      linking?.smartLinks?.provider ||
      (smartLinks && smartLinks.provider) ||
      (UNSAFE_cards && UNSAFE_cards.provider);
    if (cardProvider) {
      this.providerFactory.setProvider('cardProvider', cardProvider);
    }

    this.providerFactory.setProvider(
      'autoformattingProvider',
      autoformattingProvider,
    );

    if (extensionProvider) {
      this.providerFactory.setProvider(
        'extensionProvider',
        Promise.resolve(extensionProvider),
      );
    }

    if (quickInsertProvider) {
      this.providerFactory.setProvider(
        'quickInsertProvider',
        quickInsertProvider,
      );
    }
  }

  private getBaseFontSize() {
    return !['comment', 'chromeless', 'mobile'].includes(this.props.appearance!)
      ? akEditorFullPageDefaultFontSize
      : undefined;
  }

  handleSave = (view: EditorView): void => {
    if (!this.props.onSave) {
      return;
    }

    return this.props.onSave(view);
  };

  handleAnalyticsEvent: FireAnalyticsCallback = (data) =>
    fireAnalyticsEvent(this.createAnalyticsEvent)(data);

  render() {
    const Component = getUiComponent(this.props.appearance!);

    const overriddenEditorProps = {
      ...this.props,
      onSave: this.props.onSave ? this.handleSave : undefined,
      // noop all analytic events, even if a handler is still passed.
      analyticsHandler: undefined,
    };

    const featureFlags = createFeatureFlagsFromProps(this.props);
    const renderTracking =
      this.props.performanceTracking?.renderTracking?.editor;
    const renderTrackingEnabled = renderTracking?.enabled;
    const useShallow = renderTracking?.useShallow;

    return (
      <FabricEditorAnalyticsContext
        data={{
          packageName: name,
          packageVersion: version,
          componentName: 'editorCore',
          appearance: getAnalyticsAppearance(this.props.appearance),
          editorSessionId: this.editorSessionId,
        }}
      >
        <WithCreateAnalyticsEvent
          render={(createAnalyticsEvent) =>
            (this.createAnalyticsEvent = createAnalyticsEvent) && (
              <Fragment>
                {renderTrackingEnabled && (
                  <RenderTracking
                    componentProps={this.props}
                    action={ACTION.RE_RENDERED}
                    actionSubject={ACTION_SUBJECT.EDITOR}
                    handleAnalyticsEvent={this.handleAnalyticsEvent}
                    propsToIgnore={['defaultValue']}
                    useShallow={useShallow}
                  />
                )}
                <ErrorBoundary
                  createAnalyticsEvent={createAnalyticsEvent}
                  contextIdentifierProvider={
                    this.props.contextIdentifierProvider
                  }
                >
                  <WidthProvider css={fullHeight}>
                    <EditorContext editorActions={this.editorActions}>
                      <ContextAdapter>
                        <PortalProviderWithThemeProviders
                          onAnalyticsEvent={this.handleAnalyticsEvent}
                          useAnalyticsContext={
                            this.props.UNSAFE_useAnalyticsContext
                          }
                          render={(portalProviderAPI) => (
                            <Fragment>
                              <ReactEditorView
                                editorProps={overriddenEditorProps}
                                createAnalyticsEvent={createAnalyticsEvent}
                                portalProviderAPI={portalProviderAPI}
                                providerFactory={this.providerFactory}
                                onEditorCreated={this.onEditorCreated}
                                onEditorDestroyed={this.onEditorDestroyed}
                                allowAnalyticsGASV3={
                                  this.props.allowAnalyticsGASV3
                                }
                                disabled={this.props.disabled}
                                render={({
                                  editor,
                                  view,
                                  eventDispatcher,
                                  config,
                                  dispatchAnalyticsEvent,
                                  editorRef,
                                }) => (
                                  <BaseTheme
                                    baseFontSize={this.getBaseFontSize()}
                                  >
                                    <Component
                                      innerRef={editorRef}
                                      appearance={this.props.appearance!}
                                      disabled={this.props.disabled}
                                      editorActions={this.editorActions}
                                      editorDOMElement={editor}
                                      editorView={view}
                                      providerFactory={this.providerFactory}
                                      eventDispatcher={eventDispatcher}
                                      dispatchAnalyticsEvent={
                                        dispatchAnalyticsEvent
                                      }
                                      maxHeight={this.props.maxHeight}
                                      minHeight={this.props.minHeight}
                                      onSave={
                                        this.props.onSave
                                          ? this.handleSave
                                          : undefined
                                      }
                                      onCancel={this.props.onCancel}
                                      popupsMountPoint={
                                        this.props.popupsMountPoint
                                      }
                                      popupsBoundariesElement={
                                        this.props.popupsBoundariesElement
                                      }
                                      popupsScrollableElement={
                                        this.props.popupsScrollableElement
                                      }
                                      contentComponents={
                                        config.contentComponents
                                      }
                                      primaryToolbarComponents={
                                        config.primaryToolbarComponents
                                      }
                                      primaryToolbarIconBefore={
                                        this.props.primaryToolbarIconBefore
                                      }
                                      secondaryToolbarComponents={
                                        config.secondaryToolbarComponents
                                      }
                                      insertMenuItems={
                                        this.props.insertMenuItems
                                      }
                                      customContentComponents={
                                        this.props.contentComponents
                                      }
                                      customPrimaryToolbarComponents={
                                        this.props.primaryToolbarComponents
                                      }
                                      customSecondaryToolbarComponents={
                                        this.props.secondaryToolbarComponents
                                      }
                                      contextPanel={this.props.contextPanel}
                                      collabEdit={this.props.collabEdit}
                                      persistScrollGutter={
                                        this.props.persistScrollGutter
                                      }
                                      enableToolbarMinWidth={
                                        this.props.featureFlags
                                          ?.toolbarMinWidthOverflow != null
                                          ? !!this.props.featureFlags
                                              ?.toolbarMinWidthOverflow
                                          : this.props.allowUndoRedoButtons
                                      }
                                      useStickyToolbar={
                                        this.props.useStickyToolbar
                                      }
                                      featureFlags={featureFlags}
                                    />
                                  </BaseTheme>
                                )}
                              />
                              <PortalRenderer
                                portalProviderAPI={portalProviderAPI}
                              />
                            </Fragment>
                          )}
                        />
                      </ContextAdapter>
                    </EditorContext>
                  </WidthProvider>
                </ErrorBoundary>
              </Fragment>
            )
          }
        />
      </FabricEditorAnalyticsContext>
    );
  }
}
