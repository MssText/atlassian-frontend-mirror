import {
  PuppeteerPage,
  waitForTooltip,
} from '@atlaskit/visual-regression/helper';
import { waitForMediaToBeLoaded } from '../../__helpers/page-objects/_media';
import { snapshot, initEditorWithAdf, Appearance } from '../_utils';
import mediaSingleVideoAdf from '../table/__fixtures__/mediasingle-video.adf.json';
import { waitForFloatingControl } from '../../__helpers/page-objects/_toolbar';

describe('Snapshot Test: Media inline video player', () => {
  let page: PuppeteerPage;

  beforeEach(async () => {
    page = global.page;
    await initEditorWithAdf(page, {
      appearance: Appearance.fullPage,
      adf: mediaSingleVideoAdf,
      editorProps: {
        media: {
          allowMediaSingle: true,
          allowResizing: true,
        },
      },
    });

    await waitForMediaToBeLoaded(page);
  });

  it('should render inline video player', async () => {
    await page.waitForSelector('[data-testid="media-file-card-view"]');
    await waitForFloatingControl(page, 'Media floating controls', {
      waitDuration: 1000,
      visible: true,
    });
    await snapshot(page);
    await page.click('[data-testid="media-file-card-view"]');
    await page.waitForSelector('[data-testid="media-card-inline-player"]');
    await page.click('[data-testid="media-card-inline-player"]');
    await waitForFloatingControl(page, 'Media floating controls');
    await snapshot(page);
    await page.click(
      '[data-testid="custom-media-player-playback-speed-toggle-button"]',
    );
    await waitForTooltip(page);
    await snapshot(page);
  });

  it('volume controls', async () => {
    await page.waitForSelector('[data-testid="media-file-card-view"]');
    await waitForFloatingControl(page, 'Media floating controls', {
      waitDuration: 1000,
      visible: true,
    });
    await page.click('[data-testid="media-file-card-view"]');
    await page.waitForSelector('[data-testid="media-card-inline-player"]');
    await page.click('[data-testid="media-card-inline-player"]');
    await waitForFloatingControl(page, 'Media floating controls');
    await page.hover(
      '[data-testid="custom-media-player-volume-toggle-button"]',
    );
    await snapshot(page);
    await page.click(
      '[data-testid="custom-media-player-volume-toggle-button"]',
    );
    await snapshot(page);
  });
});
