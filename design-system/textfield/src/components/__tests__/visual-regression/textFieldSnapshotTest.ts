import {
  getExampleUrl,
  takeScreenShot,
} from '@atlaskit/visual-regression/helper';

declare var global: any;

// TODO - identify threshold or do not set cursor
describe('Snapshot Test', () => {
  it('Textfield variations should match production example', async () => {
    const url = getExampleUrl(
      'design-system',
      'textfield',
      'variations',
      global.__BASEURL__,
    );
    const image = await takeScreenShot(global.page, url);
    expect(image).toMatchProdImageSnapshot();
  });
});
