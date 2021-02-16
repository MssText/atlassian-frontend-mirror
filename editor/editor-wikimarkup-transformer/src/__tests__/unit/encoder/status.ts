import { defaultSchema } from '@atlaskit/adf-schema';
import WikiMarkupTransformer from '../../../index';

import { doc, status, p } from '@atlaskit/editor-test-helpers/schema-builder';

describe('ADF => WikiMarkup - Status', () => {
  const transformer = new WikiMarkupTransformer();

  test('should convert status node with same color', () => {
    const node = doc(
      p(
        'This document is already ',
        status({
          text: 'finished',
          color: 'red',
          localId: '3cf433a6-5fd1-4803-9488-8b1b09a293b3',
        }),
      ),
    )(defaultSchema);
    expect(transformer.encode(node)).toMatchSnapshot();
  });
  test('should convert status node with neutral color', () => {
    const node = doc(
      p(
        'This document is already ',
        status({
          text: 'grey',
          color: 'neutral',
          localId: '3cf433a6-5fd1-4803-9488-8b1b09a293b3',
        }),
      ),
    )(defaultSchema);
    expect(transformer.encode(node)).toMatchSnapshot();
  });
});
