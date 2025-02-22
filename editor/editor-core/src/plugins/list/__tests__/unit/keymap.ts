import randomId from '@atlaskit/editor-test-helpers/random-id';

import {
  doc,
  emoji,
  ol,
  ul,
  li,
  p,
  panel,
  media,
  mediaSingle,
  code_block,
  br,
  DocBuilder,
} from '@atlaskit/editor-test-helpers/doc-builder';
import {
  createProsemirrorEditorFactory,
  LightEditorPlugin,
  Preset,
} from '@atlaskit/editor-test-helpers/create-prosemirror-editor';
import { getTestEmojiResource } from '@atlaskit/util-data-test/get-test-emoji-resource';
import { grinEmoji } from '@atlaskit/util-data-test/emoji-samples';
import listPlugin from '../..';
import blockTypePlugin from '../../../block-type';
import codeBlockTypePlugin from '../../../code-block';
import emojiPlugin, { emojiPluginKey } from '../../../emoji';
import panelPlugin from '../../../panel';
import analyticsPlugin from '../../../analytics';
import mediaPlugin from '../../../media';
import featureFlagsPlugin from '../../../feature-flags-context';

import sendKeyToPm from '@atlaskit/editor-test-helpers/send-key-to-pm';
import simulatePlatform, {
  Platforms,
} from '@atlaskit/editor-test-helpers/simulate-platform';
import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';
import { EditorView } from 'prosemirror-view';
import { UIAnalyticsEvent } from '@atlaskit/analytics-next';
import { ProviderFactory } from '@atlaskit/editor-common/provider-factory';

const emojiProvider = getTestEmojiResource();

const grin = grinEmoji();
const grinEmojiId = {
  shortName: grin.shortName,
  id: grin.id,
  fallback: grin.fallback,
};

describe('lists plugin -> keymap', () => {
  const createEditor = createProsemirrorEditorFactory();
  let createAnalyticsEvent: CreateUIAnalyticsEvent;
  const providerFactory = ProviderFactory.create({ emojiProvider });

  const editor = (doc: DocBuilder) => {
    createAnalyticsEvent = jest.fn(() => ({ fire() {} } as UIAnalyticsEvent));
    const preset = new Preset<LightEditorPlugin>()
      .add([listPlugin, { restartNumberedLists: true }])
      .add(blockTypePlugin)
      .add(emojiPlugin)
      .add([codeBlockTypePlugin, { appearance: 'full-page' }])
      .add(panelPlugin)
      .add([analyticsPlugin, { createAnalyticsEvent }])
      .add([mediaPlugin, { allowMediaSingle: true }])
      .add([featureFlagsPlugin, { restartNumberedLists: true }]);

    return createEditor({
      doc,
      preset,
      providerFactory,
      pluginKey: emojiPluginKey,
    });
  };

  const testCollectionName = `media-plugin-mock-collection-${randomId()}`;
  const temporaryFileId = `temporary:${randomId()}`;

  describe('when hit Enter', () => {
    describe('on empty nested list item', () => {
      it('should create new list item in parent list', () => {
        const { editorView } = editor(
          doc(ol()(li(p('text'), ol()(li(p('{<>}')))), li(p('text')))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(editorView.state.doc).toEqualDocument(
          doc(ol()(li(p('text')), li(p('{<>}')), li(p('text')))),
        );
      });
    });

    describe('on non-empty nested list item', () => {
      it('should created new nested list item', () => {
        const { editorView } = editor(
          doc(ol()(li(p('text'), ol()(li(p('test{<>}')))), li(p('text')))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(editorView.state.doc).toEqualDocument(
          doc(
            ol()(
              li(p('text'), ol()(li(p('test')), li(p('{<>}')))),
              li(p('text')),
            ),
          ),
        );
      });
    });

    describe('on non-empty top level list item', () => {
      it('should created new list item at top level', () => {
        const { editorView } = editor(
          doc(ol()(li(p('text')), li(p('test{<>}')), li(p('text')))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(editorView.state.doc).toEqualDocument(
          doc(ol()(li(p('text')), li(p('test')), li(p('{<>}')), li(p('text')))),
        );
      });
    });

    describe('on non-empty top level list item inside panel', () => {
      it('should created new list item at top level', () => {
        const { editorView } = editor(
          doc(panel()(ol()(li(p('text')), li(p('test{<>}')), li(p('text'))))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(editorView.state.doc).toEqualDocument(
          doc(
            panel()(
              ol()(li(p('text')), li(p('test')), li(p('{<>}')), li(p('text'))),
            ),
          ),
        );
      });
    });

    describe('on empty top level list item', () => {
      it('should create new paragraph outside the list and set "order" attr on bottom orderedList to continue from the top orderedList', () => {
        const { editorView } = editor(
          doc(ol()(li(p('text')), li(p('{<>}')), li(p('text')))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(editorView.state.doc).toEqualDocument(
          doc(
            ol({ order: 1 })(li(p('text'))),
            p('{<>}'),
            ol({ order: 2 })(li(p('text'))),
          ),
        );
      });
    });

    describe('on empty top level list item inside panel', () => {
      it('should create new paragraph outside the list and set "order" attr on bottom orderedList to continue from the top orderedList', () => {
        const { editorView } = editor(
          doc(panel()(ol()(li(p('text')), li(p('{<>}')), li(p('text'))))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(editorView.state.doc).toEqualDocument(
          doc(
            panel()(
              ol({ order: 1 })(li(p('text'))),
              p('{<>}'),
              ol({ order: 2 })(li(p('text'))),
            ),
          ),
        );
      });
    });
  });

  describe('when hit Tab', () => {
    let editorView: EditorView;
    beforeEach(() => {
      ({ editorView } = editor(doc(ol()(li(p('text')), li(p('text{<>}'))))));
      sendKeyToPm(editorView, 'Tab');
    });

    it('should create a sublist', () => {
      expect(editorView.state.doc).toEqualDocument(
        doc(ol()(li(p('text'), ol()(li(p('text{<>}')))))),
      );
    });
  });

  describe('when hit Backspace', () => {
    const backspaceCheck = (beforeDoc: DocBuilder, afterDoc: DocBuilder) => {
      const { editorView } = editor(beforeDoc);
      sendKeyToPm(editorView, 'Backspace');

      const expectedDoc = afterDoc(editorView.state.schema);
      expect(editorView.state.doc.toJSON()).toEqual(expectedDoc.toJSON());

      const { state } = editorView;
      if (expectedDoc.refs['<']) {
        expect(state.selection.from).toEqual(expectedDoc.refs['<']);
        expect(state.selection.to).toEqual(expectedDoc.refs['>']);
      } else {
        expect(state.selection.from).toEqual(expectedDoc.refs['<>']);
        expect(state.selection.empty).toBe(true);
      }
    };

    it('should remove empty paragraph', () => {
      backspaceCheck(
        doc(ol()(li(p('text')), li(p('{<>}')))),
        doc(ol()(li(p('text{<>}')))),
      );
    });

    it('should move paragraph content back to previous list item', () => {
      backspaceCheck(
        doc(ol()(li(p('text')), li(p('{<>}second text')))),
        doc(ol()(li(p('text{<>}second text')))),
      );
    });

    it('should remove nested empty paragraph', () => {
      backspaceCheck(
        doc(ol()(li(p('text'), ol()(li(p('{<>}')))))),
        doc(ol()(li(p('text{<>}')))),
      );
    });

    it('should move paragraph content back to previous outdented list item', () => {
      backspaceCheck(
        doc(ol()(li(p('text'), ol()(li(p('{<>}subtext')))))),
        doc(ol()(li(p('text{<>}subtext')))),
      );
    });

    it('should move paragraph content back to previous (nested) list item', () => {
      backspaceCheck(
        doc(ol()(li(p('text'), ol()(li(p('text'))))), p('{<>}after')),
        doc(ol()(li(p('text'), ol()(li(p('text{<>}after')))))),
      );
    });

    it('keeps nodes same level as backspaced list item together in same list', () => {
      backspaceCheck(
        doc(
          // prettier-ignore
          ol()(
            li(
              p('{<>}A'),
              ol()(
                li(p('B')),
              ),
            ),
            li(p('C')),
          ),
          p('after'),
        ),
        // prettier-ignore
        doc(
          p('{<>}A'),
          ol()(
            li(p('B')),
            li(p('C')),
          ),
          p('after'),
        ),
      );
    });

    it('merges two single-level lists when the middle paragraph is backspaced', () => {
      backspaceCheck(
        doc(
          ol()(li(p('A')), li(p('B'))),

          p('{<>}middle'),

          ol()(li(p('C')), li(p('D'))),
        ),
        doc(ol()(li(p('A')), li(p('B{<>}middle')), li(p('C')), li(p('D')))),
      );
    });

    it('merges two double-level lists when the middle paragraph is backspaced', () => {
      backspaceCheck(
        doc(
          ol()(li(p('A'), ol()(li(p('B')))), li(p('C'))),

          p('{<>}middle'),

          ol()(li(p('D'), ol()(li(p('E')))), li(p('F'))),
        ),
        doc(
          ol()(
            li(p('A'), ol()(li(p('B')))),
            li(p('C{<>}middle')),
            li(p('D'), ol()(li(p('E')))),
            li(p('F')),
          ),
        ),
      );
    });

    it('moves directly to previous list item if it was empty', () => {
      backspaceCheck(
        doc(
          ol()(li(p('nice')), li(p('')), li(p('{<>}text'))),

          p('after'),
        ),
        doc(
          ol()(li(p('nice')), li(p('{<>}text'))),

          p('after'),
        ),
      );
    });

    it('moves directly to previous list item if it was empty, but with two paragraphs', () => {
      backspaceCheck(
        doc(
          ol()(li(p('nice')), li(p('')), li(p('{<>}text'), p('double'))),

          p('after'),
        ),
        doc(
          ol()(li(p('nice')), li(p('{<>}text'), p('double'))),

          p('after'),
        ),
      );
    });

    it('backspaces paragraphs within a list item rather than the item itself', () => {
      backspaceCheck(
        doc(
          ol()(li(p('')), li(p('nice'), p('{<>}two'))),

          p('after'),
        ),
        doc(
          ol()(li(p('')), li(p('nice{<>}two'))),

          p('after'),
        ),
      );
    });

    it('backspaces line breaks correctly within list items, with content after', () => {
      backspaceCheck(
        doc(
          ol()(li(p('')), li(p('nice'), p('two', br(), '{<>}three'))),

          p('after'),
        ),
        doc(
          ol()(li(p('')), li(p('nice'), p('two{<>}three'))),

          p('after'),
        ),
      );
    });

    it('backspaces line breaks correctly within list items, with content before', () => {
      backspaceCheck(
        doc(
          ol()(li(p('')), li(p('nice'), p('two', br(), br(), '{<>}'))),

          p('after'),
        ),
        doc(
          ol()(li(p('')), li(p('nice'), p('two', br(), '{<>}'))),

          p('after'),
        ),
      );
    });

    it('backspaces correctly with paragraphs after the list items', () => {
      backspaceCheck(
        doc(
          ol()(li(p('')), li(p('nice'), p('two'))),
          p('{<>}'),
          p(''),
          p(''),
          p('after'),
        ),
        doc(
          ol()(li(p('')), li(p('nice'), p('two', '{<>}'))),
          p(''),
          p(''),
          p('after'),
        ),
      );
    });

    it('backspaces correctly with paragraphs after an empty list item', () => {
      backspaceCheck(
        doc(
          ol()(li(p('first')), li(p(''))),
          p('{<>}'),
          p(''),
          p(''),
          p('after'),
        ),
        doc(ol()(li(p('first')), li(p('{<>}'))), p(''), p(''), p('after')),
      );
    });

    it('backspaces correctly with paragraphs after the list items with emoji', () => {
      backspaceCheck(
        doc(
          ol()(li(p('')), li(p('nice', emoji(grinEmojiId)()))),
          p('{<>}'),
          p(''),
          p(''),
          p('after'),
        ),
        doc(
          ol()(li(p('')), li(p('nice', emoji(grinEmojiId)(), '{<>}'))),
          p(''),
          p(''),
          p('after'),
        ),
      );
    });

    it('moves text from after list to below mediaSingle in list item', () => {
      backspaceCheck(
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
              p(''),
            ),
          ),

          p('{<>}after'),
        ),
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
              p('{<>}after'),
            ),
          ),
        ),
      );
    });

    it('moves text from after list to into a new list item', () => {
      backspaceCheck(
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
            ),
          ),

          p('{<>}after'),
        ),
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
            ),
            li(p('{<>}after')),
          ),
        ),
      );
    });

    it('empty paragraph after list should select media', () => {
      backspaceCheck(
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'wrap-left' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
            ),
          ),

          p('{<>}'),
        ),
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              '{<}',
              mediaSingle({ layout: 'wrap-left' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
              '{>}',
            ),
          ),
        ),
      );
    });

    it('moves code block from after list to into a new list item', () => {
      backspaceCheck(
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
            ),
          ),

          code_block()('{<>}after'),
        ),
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
            ),
            li(code_block()('{<>}after')),
          ),
        ),
      );
    });

    it('moves empty paragraph inside code block', () => {
      backspaceCheck(
        doc(
          ol()(li(p('')), li(p('nice'), code_block()('hello'))),

          p('{<>}'),
        ),
        doc(ol()(li(p('')), li(p('nice'), code_block()('hello{<>}')))),
      );
    });

    it('selects mediaSingle in list if inside the empty paragraph after', () => {
      backspaceCheck(
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
              p('{<>}'),
            ),
          ),

          p('after'),
        ),
        doc(
          ol()(
            li(p('')),
            li(
              p('nice'),
              '{<}',
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
              '{>}',
            ),
          ),
          p('after'),
        ),
      );
    });

    it('backspaces mediaSingle in list if selected', () => {
      backspaceCheck(
        doc(
          ol()(
            li(p('')),
            li(
              p('nice{<}'),
              mediaSingle({ layout: 'center' })(
                media({
                  id: temporaryFileId,
                  type: 'file',
                  collection: testCollectionName,
                  __fileMimeType: 'image/png',
                })(),
              ),
              '{>}',
            ),
          ),
          p('after'),
        ),
        doc(ol()(li(p('')), li(p('nice{<>}'))), p('after')),
      );
    });
  });

  describe('when hit Shift-Tab', () => {
    let editorView: EditorView;
    beforeEach(() => {
      ({ editorView } = editor(doc(ol()(li(p('One'), ul(li(p('Two{<>}'))))))));
      sendKeyToPm(editorView, 'Shift-Tab');
    });

    it('should outdent the list', () => {
      expect(editorView.state.doc).toEqualDocument(
        doc(ol()(li(p('One')), li(p('Two{<>}')))),
      );
    });
  });

  describe('when hit Cmd-Shift-7', () => {
    simulatePlatform(Platforms.Mac);

    let editorView: EditorView;
    beforeEach(() => {
      ({ editorView } = editor(doc(p('One{<>}'))));
      sendKeyToPm(editorView, 'Cmd-Shift-7');
    });

    it('should create a list', () => {
      expect(editorView.state.doc).toEqualDocument(doc(ol()(li(p('One')))));
    });

    it('should call numbered list analytics V3 event', () => {
      expect(createAnalyticsEvent).toHaveBeenCalledWith({
        action: 'inserted',
        actionSubject: 'list',
        eventType: 'track',
        actionSubjectId: 'numberedList',
        attributes: expect.objectContaining({
          inputMethod: 'keyboard',
        }),
      });
    });
  });

  describe('when hit Cmd-Shift-8', () => {
    simulatePlatform(Platforms.Mac);

    let editorView: EditorView;
    beforeEach(() => {
      ({ editorView } = editor(doc(p('One{<>}'))));
      sendKeyToPm(editorView, 'Cmd-Shift-8');
    });

    it('should create a list', () => {
      expect(editorView.state.doc).toEqualDocument(doc(ul(li(p('One')))));
    });

    it('should call numbered list analytics V3 event', () => {
      expect(createAnalyticsEvent).toHaveBeenCalledWith({
        action: 'inserted',
        actionSubject: 'list',
        eventType: 'track',
        actionSubjectId: 'bulletedList',
        attributes: expect.objectContaining({
          inputMethod: 'keyboard',
        }),
      });
    });
  });
});
