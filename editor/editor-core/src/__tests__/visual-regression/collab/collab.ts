import {
  PuppeteerPage,
  waitForElementCount,
  waitForLoadedBackgroundImages,
} from '@atlaskit/visual-regression/helper';
import { mainToolbarSelector } from '@atlaskit/editor-test-helpers/page-objects/toolbar';
import {
  snapshot,
  editorSelector,
  initEditorWithAdf,
  Appearance,
} from '@atlaskit/editor-test-helpers/vr-utils/base-utils';

async function waitForCollabAvatars(page: PuppeteerPage) {
  // Wait for both editors (and their toolbars)
  await waitForElementCount(page, mainToolbarSelector, 2);

  // Wait for avatar image downloads
  const avatarSelectors = [
    `span[aria-label="Rick Sanchez"][role="img"]`,
    `span[aria-label="Morty Smith"][role="img"]`,
    `span[aria-label="Summer Smith"][role="img"]`,
  ];

  avatarSelectors.forEach(async (selector) => {
    await waitForElementCount(page, selector, 2);
    await waitForLoadedBackgroundImages(page, selector);
  });
}

describe('Collab', () => {
  // FIXME: This test was automatically skipped due to failure on 24/01/2023: https://product-fabric.atlassian.net/browse/ED-16632
  it.skip('displays default collab UI', async () => {
    const page = global.page;
    const adf = {};

    await initEditorWithAdf(page, {
      adf,
      appearance: Appearance.fullPage,
      viewport: { width: 1280, height: 600 },
      withCollab: true,
    });

    // Wait for avatars within each instance
    await waitForCollabAvatars(page);
    await snapshot(page, undefined, editorSelector);
  });
});
