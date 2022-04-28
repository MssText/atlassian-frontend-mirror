import { getURL, setup, takeSnapshot } from '../__utils__/vr-helpers';

describe('Flexible Card', () => {
  it('renders FlexibleCard', async () => {
    const url = getURL('vr-flexible-ui-options');
    const page = await setup(url);
    await page.waitForSelector('[data-testid="smart-links-container"]');

    const image = await takeSnapshot(page, 750);
    expect(image).toMatchProdImageSnapshot();
  });

  describe('blocks', () => {
    it('renders block feature', async () => {
      const url = getURL('vr-flexible-ui-block');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="smart-links-container"]');
      const image = await takeSnapshot(page, 520);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders TitleBlock', async () => {
      const url = getURL('vr-flexible-ui-block-title');
      const screenshotSize = 2180;
      const page = await setup(url);

      await page.waitForSelector('[data-testid="smart-links-container"]');

      let image = await takeSnapshot(page, screenshotSize);
      expect(image).toMatchProdImageSnapshot();

      // Hover over "more actions" (three dots) button on "action on hover only" row
      const hoverActionsRowSelector =
        '[data-testid="actions-on-hover-title-block-resolved-view"]';
      await page.waitForSelector(hoverActionsRowSelector);
      await page.hover(hoverActionsRowSelector);

      const moreActionsSelector = `${hoverActionsRowSelector} [data-testid="action-group-more-button"]`;
      await page.waitForSelector(moreActionsSelector, { visible: true });

      image = await takeSnapshot(page, screenshotSize);
      expect(image).toMatchProdImageSnapshot();

      await page.click(moreActionsSelector);

      // Hover over "delete action". We want to test dropdown trigger does not disappear
      const deleteActionSelector = `[data-testid="smart-action-delete-action"]`;
      await page.waitForSelector(deleteActionSelector);
      await page.hover(deleteActionSelector);

      image = await takeSnapshot(page, screenshotSize);
      expect(image).toMatchProdImageSnapshot();
    });

    it('renders MetadataBlock', async () => {
      const url = getURL('vr-flexible-ui-block-metadata');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="smart-links-container"]');
      const image = await takeSnapshot(page, 1200);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders SnippetBlock', async () => {
      const url = getURL('vr-flexible-ui-block-snippet');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="smart-links-container"]');
      const image = await takeSnapshot(page, 400);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders Footer Block', async () => {
      const url = getURL('vr-flexible-ui-block-footer');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="smart-links-container"]');
      const image = await takeSnapshot(page, 810);

      expect(image).toMatchProdImageSnapshot();

      // Click on "more actions" (three dots) button.
      await page.waitForSelector('[data-testid="action-group-more-button"]');
      await page.click('[data-testid="action-group-more-button"]');

      await page.waitForSelector('[data-testid="third-action-item"]');
      const image2 = await takeSnapshot(page, 810);

      expect(image2).toMatchProdImageSnapshot();
    });

    it('renders PreviewBlock', async () => {
      const url = getURL('vr-flexible-ui-block-preview');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="smart-links-container"]');
      const image = await takeSnapshot(page, 1000);

      expect(image).toMatchProdImageSnapshot();
    });
  });

  describe('actions', () => {
    it('renders Action', async () => {
      const url = getURL('vr-flexible-ui-action');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="vr-test-delete-action"]');

      const image = await takeSnapshot(page, 450);
      expect(image).toMatchProdImageSnapshot();
    });
  });

  describe('elements', () => {
    it('renders link', async () => {
      const url = getURL('vr-flexible-ui-element-link');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="vr-test-title"]');
      const image = await takeSnapshot(page, 630);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders icon', async () => {
      const url = getURL('vr-flexible-ui-element-icon');
      const page = await setup(url);
      await page.waitForSelector(`[data-testid="vr-test-icon-0-0"]`);

      await page.evaluate(() => {
        // @ts-ignore TS2339: Property 'setLoadingIconUrl' does not exist on type 'Window & typeof globalThis'
        setLoadingIconUrl();
      });
      await page.waitForSelector('[data-testid="vr-test-image-icon-loading"]');

      const image = await takeSnapshot(page, 650);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders lozenge', async () => {
      const url = getURL('vr-flexible-ui-element-lozenge');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="vr-test-lozenge"]');
      const image = await takeSnapshot(page, 170);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders badge', async () => {
      const url = getURL('vr-flexible-ui-element-badge');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="vr-test-badge-comment"]');
      const image = await takeSnapshot(page, 430);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders avatar group', async () => {
      const url = getURL('vr-flexible-ui-element-avatar-group');
      const page = await setup(url);
      await page.waitForSelector(
        '[data-testid="vr-test-author-group-xlarge-0--avatar-group"]',
      );
      const image = await takeSnapshot(page, 390);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders text', async () => {
      const url = getURL('vr-flexible-ui-element-text-and-date');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="vr-test-text"]');
      const image = await takeSnapshot(page, 230);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders media', async () => {
      const url = getURL('vr-flexible-ui-element-media');
      const page = await setup(url);
      await page.waitForSelector('[data-testid="vr-test-media"]');
      const image = await takeSnapshot(page, 690);

      expect(image).toMatchProdImageSnapshot();
    });
  });

  describe('integrated', () => {
    it('should render error view when exception is thrown', async () => {
      const url = getURL('flexible-ui');
      const page = await setup(url);

      // Make sure we wait for actual module to load
      // (currently we hide placeholder module, which causes sudden change
      // in height of the page and wrong button is pressed)
      await page.waitForSelector('[data-testid="smart-links-container"]');

      const buttonSelector =
        '[data-testid="mock-url-button-ResolveUnsupportedError"]';
      await page.waitForSelector(buttonSelector);
      await page.click(buttonSelector);

      const erroredViewSelector =
        '[data-testid="smart-block-title-errored-view"]';
      await page.waitForSelector(erroredViewSelector);
      const image = await takeSnapshot(page, 80);

      expect(image).toMatchProdImageSnapshot();
    });

    it('renders various compositions', async () => {
      const url = getURL('vr-flexible-ui-composition');
      const page = await setup(url);

      await page.waitForSelector('[data-testid="smart-links-container"]');

      const buttonSelector = '[data-testid="smart-action-delete-action"]';
      await page.waitForSelector(buttonSelector);
      await page.hover(buttonSelector);

      const image = await takeSnapshot(page, 240);

      expect(image).toMatchProdImageSnapshot();
    });
  });
});
