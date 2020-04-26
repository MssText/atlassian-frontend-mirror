import React from 'react';
import { customInsertMenuItems } from '@atlaskit/editor-test-helpers/mock-insert-menu';
import {
  ExampleCreateInlineCommentComponent,
  ExampleViewInlineCommentComponent,
} from '@atlaskit/editor-test-helpers';
import {
  createEditorExampleForTests,
  mapProvidersToProps,
} from '../example-helpers/create-editor-example-for-tests';
import {
  Editor,
  ContextPanel,
  AnnotationProvider,
  AnnotationTypes,
} from '../src';
import { SaveAndCancelButtons } from './5-full-page';
import { TitleInput } from '../example-helpers/PageElements';

export default function EditorExampleForIntegrationTests({ clipboard = true }) {
  return createEditorExampleForTests<any>(
    (props, nonSerializableProps, lifecycleHandlers) => {
      const { onMount, onChange, onDestroy } = lifecycleHandlers;

      if (props && props.primaryToolbarComponents) {
        props.primaryToolbarComponents = <SaveAndCancelButtons />;
      }

      if (props && props.contentComponents) {
        props.contentComponents = (
          <TitleInput placeholder="Give this page a title..." />
        );
      }

      if (nonSerializableProps.withContextPanel) {
        props.contextPanel = (
          <ContextPanel visible={true}>
            {new Array(50).fill(
              <p>Somebody once told me the world is gonna roll me</p>,
            )}
          </ContextPanel>
        );
      }

      if (props.media) {
        props.media = {
          allowMediaSingle: true,
          allowResizing: true,
          allowResizingInTables: true,
          allowLinking: true,
          ...props.media,
        };
      }

      // Annotations (inline comments)
      if (props && props.annotationProvider) {
        const annotationProvider: AnnotationProvider = {
          createComponent: ExampleCreateInlineCommentComponent,
          viewComponent: ExampleViewInlineCommentComponent,
          providers: {
            inlineComment: {
              getState: async (ids: string[]) =>
                ids.map(id => ({
                  annotationType: AnnotationTypes.INLINE_COMMENT,
                  id,
                  state: { resolved: false },
                })),
            },
          },
        };
        props.annotationProvider = annotationProvider;
      }

      return (
        <Editor
          {...mapProvidersToProps(nonSerializableProps.providers, props)}
          {...nonSerializableProps.providers}
          insertMenuItems={customInsertMenuItems}
          extensionHandlers={nonSerializableProps.extensionHandlers}
          onEditorReady={onMount}
          onChange={onChange}
          onDestroy={onDestroy}
        />
      );
    },
    { clipboard },
  );
}
