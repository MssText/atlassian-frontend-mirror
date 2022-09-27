import React from 'react';

import ReactDOM from 'react-dom';

import noop from '@atlaskit/ds-lib/noop';
import { getExamplesFor, ssr } from '@atlaskit/ssr';

jest.spyOn(global.console, 'error').mockImplementation(noop);

afterEach(() => {
  jest.resetAllMocks();
});

test('should ssr then hydrate datetime-picker correctly', async (done) => {
  const [example] = await getExamplesFor('datetime-picker');
  const Example = require(example.filePath).default; // eslint-disable-line import/no-dynamic-require

  const elem = document.createElement('div');
  elem.innerHTML = await ssr(example.filePath);

  ReactDOM.hydrate(<Example />, elem);
  // ignore warnings caused by emotion's server-side rendering approach
  // eslint-disable-next-line no-console
  const mockCalls = (console.error as jest.Mock).mock.calls.filter(
    ([f, s]) =>
      !(
        f ===
          'Warning: Did not expect server HTML to contain a <%s> in <%s>.%s' &&
        s === 'style'
      ),
  );

  expect(mockCalls.length).toBe(0);
  done();
});
