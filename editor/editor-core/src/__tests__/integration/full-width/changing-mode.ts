import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import {
  fullpage,
  setProseMirrorTextSelection,
  updateEditorProps,
} from '../_helpers';
import {
  goToEditorTestingWDExample,
  mountEditor,
} from '../../__helpers/testing-example-helpers';

import { mediumSizeDoc } from './__fixtures__/medium-document';

BrowserTestCase(
  'Should transition successfully, without error, when a selection over react nodes exists',
  // `page.checkConsoleErrors` only runs on Chrome so we skip all other browsers.
  { skip: ['safari', 'firefox'] },
  async (client: any) => {
    const page = await goToEditorTestingWDExample(client);
    await mountEditor(
      page,
      {
        appearance: fullpage.appearance,
        defaultValue: JSON.stringify(mediumSizeDoc),
        allowTables: {
          advanced: true,
        },
        allowLayouts: {
          allowBreakout: true,
          UNSAFE_addSidebarLayouts: true,
        },
      },
      {
        i18n: { locale: 'en' },
      },
    );

    await setProseMirrorTextSelection(page, { anchor: 314, head: 308 });
    await updateEditorProps(page, { appearance: 'full-width' });

    await page.checkConsoleErrors({
      ignoreErrors: [
        /is potentially unsafe when doing server-side rendering\. Try changing it to/,
        /has been deprecated\. It is an internal component and should not be used directly\./,
      ],
    });
  },
);
