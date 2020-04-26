import Page from '@atlaskit/webdriver-runner/wd-wrapper';
import { getExampleUrl } from '@atlaskit/visual-regression/helper';
import { mediaMockQueryOptInFlag } from '@atlaskit/media-test-helpers';
import { EditorProps } from '../../types';
import {
  clipboardInput,
  copyAsPlaintextButton,
  copyAsHTMLButton,
} from '../integration/_helpers';
import { MountEditorOptions } from '../../../example-helpers/create-editor-example-for-tests';
import { FullPageEditor } from './page-objects/_media';

export async function loadLocale(page: Page, locales: Array<string>) {
  await page.executeAsync((locales, done) => {
    (window as any).__loadReactIntlLocale(locales, done);
  }, locales);
}

export async function mountEditor<T = EditorProps>(
  page: Page,
  props: T,
  options?: MountEditorOptions,
) {
  await page.waitForSelector('#editor-container');
  await page.executeAsync(
    (props: T, options: MountEditorOptions | undefined, done: () => void) => {
      function waitAndCall() {
        if ((window as any).__mountEditor) {
          (window as any).__mountEditor(props, options || {});
          done();
        } else {
          // There is no need to implement own timeout, if done() is not called on time,
          // webdriver will throw with own timeout.
          setTimeout(waitAndCall, 20);
        }
      }

      waitAndCall();
    },
    props,
    options || {},
  );
  await page.waitForSelector('.ProseMirror', { timeout: 500 });
  await page.click('.ProseMirror');
}

export async function goToEditorTestingExample(
  client: ConstructorParameters<typeof Page>[0],
) {
  const page = new Page(client);
  const currentUrl = await page.url();
  const url = getExampleUrl(
    'editor',
    'editor-core',
    'testing',
    // @ts-ignore
    global.__BASEURL__,
  );

  if (currentUrl !== url) {
    await page.goto(url);
  }

  await page.maximizeWindow();

  return page;
}

export async function goToEditorLabsTestingExample(
  client: ConstructorParameters<typeof Page>[0],
  appearance: 'mobile' | 'full-page' = 'full-page',
) {
  const page = new Page(client);
  const currentUrl = await page.url();
  const url = getExampleUrl(
    'editor',
    'editor-core',
    `testing-archv3-${appearance}`,
    // @ts-ignore
    global.__BASEURL__,
  );

  if (currentUrl !== url) {
    await page.goto(url);
  }

  await page.maximizeWindow();

  return page;
}

export async function goToFullPage(
  client: ConstructorParameters<typeof Page>[0],
) {
  const page = new FullPageEditor(client);
  const url =
    getExampleUrl(
      'editor',
      'editor-core',
      'full-page',
      // @ts-ignore
      global.__BASEURL__,
    ) + `&${mediaMockQueryOptInFlag}`;

  await page.goto(url);
  await page.maximizeWindow();
  await page.waitForSelector('.ProseMirror', { timeout: 500 });
  await page.click('.ProseMirror');

  return page;
}

export async function copyAsPlainText(page: Page, data: string) {
  await page.isVisible(clipboardInput);
  await page.clear(clipboardInput);
  await page.type(clipboardInput, data);
  await page.click(copyAsPlaintextButton);
}

export async function copyAsHTML(page: Page, data: string) {
  await page.isVisible(clipboardInput);
  await page.clear(clipboardInput);
  await page.type(clipboardInput, data);
  await page.click(copyAsHTMLButton);
}
