import { TaskState, ObjectKey } from '@atlaskit/task-decision';
import RendererBridge, { ScrollToContentNode } from './bridge';
import { AnnotationPayload, AnnotationStatePayload } from '../types';
import { Serialized } from '../../types';
import WebBridge from '../../web-bridge';
import { eventDispatcher, EmitterEvents } from '../dispatcher';
import { resolvePromise, rejectPromise } from '../../cross-platform-promise';
import { TaskDecisionProviderImpl } from '../../providers/taskDecisionProvider';
import { toNativeBridge } from '../web-to-native/implementation';
import { getElementScrollOffsetByNodeType, scrollToElement } from './utils';
import { JSONDocNode } from '@atlaskit/editor-json-transformer';

class RendererMobileWebBridgeOverride extends WebBridge {
  containerAri?: string;
  objectAri?: string;

  sendHeight(height: number) {
    toNativeBridge.call('renderBridge', 'onRenderedContentHeightChanged', {
      height,
    });
  }

  getRootElement(): HTMLElement | null {
    return document.querySelector('#renderer');
  }
}

class RendererBridgeImplementation extends RendererMobileWebBridgeOverride
  implements RendererBridge {
  taskDecisionProvider?: Promise<TaskDecisionProviderImpl>;

  setContent(content: Serialized<JSONDocNode>) {
    if (!eventDispatcher) {
      return;
    }
    let adfContent: JSONDocNode;
    if (typeof content === 'string') {
      try {
        adfContent = JSON.parse(content);
      } catch (e) {
        return;
      }
    } else {
      adfContent = content;
    }

    eventDispatcher.emit(EmitterEvents.SET_RENDERER_CONTENT, {
      content: adfContent,
    });
  }

  onPromiseResolved(uuid: string, payload: string) {
    resolvePromise(uuid, JSON.parse(payload));
  }

  onPromiseRejected(uuid: string) {
    rejectPromise(uuid);
  }

  /**
   * Find a matching content node and scroll it into view.
   *
   * Usage of this method is suitable when the WebView controls scrolling (using <body /> scrolling).
   *
   * @param node The name of the content node type you wish to scroll to.
   * @param id The identifier used for the selector.
   * @param index An optional index in case the identifier isn't unique per instance.
   *
   */
  scrollToContentNode(
    nodeType: ScrollToContentNode,
    id: string,
    index = -1,
  ): void {
    if (nodeType === ScrollToContentNode.HEADING) {
      eventDispatcher.emit(EmitterEvents.SET_ACTIVE_HEADING_ID, id);
    }

    // eslint-disable-next-line compat/compat
    if (window.requestIdleCallback) {
      // eslint-disable-next-line compat/compat
      return window.requestIdleCallback(() => {
        scrollToElement(nodeType, id, index);
      });
    }

    requestAnimationFrame(() => {
      scrollToElement(nodeType, id, index);
    });
  }

  /**
   * Find a matching content node and return its vertical and horizontal scroll offset, relative to the top and left of the document.
   *
   * Usage of this method is suitable when the Native app wrapper controls scrolling (e.g. WebView height matches the content height).
   * At which point the caller can use the returned value to calculate and determine the scroll position relative to the UI layer
   * containing the WebView and scroll it into view itself.
   *
   * @param node The name of the content node type you wish to scroll to.
   * @param id The identifier used for the selector.
   * @param index An optional index in case the identifier isn't unique per instance.
   *
   * @return An object with x and y representing the pixel offset number for each axis.
   */
  getContentNodeScrollOffset(
    nodeType: ScrollToContentNode,
    id: string,
    index = -1,
  ): string {
    if (nodeType === ScrollToContentNode.HEADING) {
      eventDispatcher.emit(EmitterEvents.SET_ACTIVE_HEADING_ID, id);
    }
    return JSON.stringify(
      getElementScrollOffsetByNodeType(nodeType, id, index),
    );
  }

  /** @deprecated  Use `getContentNodeScrollOffset` instead */
  getContentNodeScrollOffsetY(
    nodeType: ScrollToContentNode,
    id: string,
    index = -1,
  ): string {
    const { y: axisYOffset } = getElementScrollOffsetByNodeType(
      nodeType,
      id,
      index,
    );

    return `${axisYOffset}`;
  }

  async onTaskUpdated(taskId: string, state: TaskState) {
    if (!this.taskDecisionProvider) {
      return;
    }

    const taskDecisionProvider = await this.taskDecisionProvider;

    const key: ObjectKey = {
      localId: taskId,
      objectAri: this.objectAri!,
      containerAri: this.containerAri!,
    };

    taskDecisionProvider.notifyUpdated(key, state);
  }

  setAnnotationFocus(annotationFocusPayload?: Serialized<AnnotationPayload>) {
    if (
      typeof annotationFocusPayload === 'string' &&
      annotationFocusPayload.trim().length > 0
    ) {
      const payload = JSON.parse(annotationFocusPayload);

      eventDispatcher.emit(EmitterEvents.SET_ANNOTATION_FOCUS, payload);
    } else {
      eventDispatcher.emit(EmitterEvents.REMOVE_ANNOTATION_FOCUS);
    }
  }

  setAnnotationState(annotations: Serialized<AnnotationStatePayload[]>) {
    if (typeof annotations === 'string') {
      const payload = JSON.parse(annotations);

      eventDispatcher.emit(EmitterEvents.SET_ANNOTATION_STATE, payload);
    }
  }

  createAnnotationOnSelection(annotation: Serialized<AnnotationPayload>) {
    if (typeof annotation === 'string') {
      const payload = JSON.parse(annotation);

      eventDispatcher.emit(
        EmitterEvents.CREATE_ANNOTATION_ON_SELECTION,
        payload,
      );
    }
  }

  highlightSelection() {
    eventDispatcher.emit(EmitterEvents.APPLY_DRAFT_ANNOTATION);
  }

  cancelHighlight() {
    eventDispatcher.emit(EmitterEvents.REMOVE_DRAFT_ANNOTATION);
  }

  /**
   * Used to observe the height of the rendered content and notify the native side when that happens
   * by calling RenderBridge#onRenderedContentHeightChanged.
   *
   * @param enabled whether the height is being observed (and therefore the callback is being called).
   */
  observeRenderedContentHeight(enabled: boolean) {
    eventDispatcher.emit(
      EmitterEvents.SET_DOCUMENT_REFLOW_DETECTOR_STATUS,
      enabled,
    );
  }
}

export default RendererBridgeImplementation;
