import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import { getExampleUrl } from '@atlaskit/webdriver-runner/utils/example';
import Page from '@atlaskit/webdriver-runner/wd-wrapper';

/* Css selectors used for the test */
const openModalBtn = "[data-testid='modal-trigger']";
const modalDialog = "[data-testid='modal']";
const primaryBtn = "[data-testid='primary']";
const secondaryBtn = "[data-testid='secondary']";

BrowserTestCase(
  'Modal should have first focus on primary action, have a clickable secondary action, and be closed',
  {},
  async (client: any) => {
    const url = getExampleUrl('design-system', 'modal-dialog', 'defaultModal');

    const modalTest = new Page(client);
    await modalTest.goto(url);
    await modalTest.waitFor(openModalBtn, 5000);
    await modalTest.click(openModalBtn);
    await modalTest.waitFor(modalDialog, 5000);

    expect(await modalTest.isVisible(modalDialog)).toBe(true);
    expect(await modalTest.hasFocus(primaryBtn)).toBe(true);

    modalTest.keys('Tab', true);
    expect(await modalTest.hasFocus(secondaryBtn)).toBe(true);

    // Focus should go back to primary action, not content body,
    // because this modal is not scrollable.
    modalTest.keys('Tab', true);
    expect(await modalTest.hasFocus(primaryBtn)).toBe(true);

    await modalTest.click(secondaryBtn);
    const textAlert = await modalTest.getAlertText();
    expect(textAlert).toBe('Secondary button has been clicked!');

    await modalTest.acceptAlert();
    await modalTest.click(primaryBtn);

    // As we have closed the modal-dialog, only the open modal button should be visible.
    await modalTest.waitFor(openModalBtn, 5000);
    expect(await modalTest.isVisible(openModalBtn)).toBe(true);
  },
);

BrowserTestCase(
  'Scrollable modal should have focus on its content',
  {},
  async (client: any) => {
    const url = getExampleUrl('design-system', 'modal-dialog', 'scroll');
    const modalDialogContent = "[data-testid='modal-dialog-content--body']";
    const scrollDownBtn = "[data-testid='scrollDown']";

    const modalTest = new Page(client);
    await modalTest.goto(url);
    await modalTest.waitFor(openModalBtn, 5000);
    await modalTest.click(openModalBtn);
    await modalTest.waitFor(modalDialog, 5000);

    expect(await modalTest.isVisible(modalDialog)).toBe(true);
    expect(await modalTest.hasFocus(primaryBtn)).toBe(true);

    modalTest.keys('Tab', true);
    expect(await modalTest.hasFocus(scrollDownBtn)).toBe(true);

    // Focus should go to content body,
    // because this modal is scrollable.
    modalTest.keys('Tab', true);
    expect(await modalTest.hasFocus(modalDialogContent)).toBe(true);

    // Focus should go back to primary action.
    modalTest.keys('Tab', true);
    expect(await modalTest.hasFocus(primaryBtn)).toBe(true);
  },
);
