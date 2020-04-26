import React, { PureComponent } from 'react';

import { ThemeProps } from '@atlaskit/theme/types';

import { normalizeLanguage, SupportedLanguages } from '../supportedLanguages';
import { applyTheme, Theme } from '../themes/themeBuilder';

import Code from './Code';

export interface CodeBlockProps {
  /** The code to be formatted */
  text: string;
  /** The language in which the code is written */
  language?: SupportedLanguages | string;
  /** Indicates whether or not to show line numbers */
  showLineNumbers?: boolean;
  /** A custom theme to be applied, implements the Theme interface */
  theme?: Theme | ThemeProps;

  /**
   * Lines to highlight comma delimited.
   * Example uses:

   * - To highlight one line `highlight="3"`
   * - To highlight a group of lines `highlight="1-5"`
   * - To highlight multiple groups `highlight="1-5,7,10,15-20"`
   */
  highlight?: string;
}

const LANGUAGE_FALLBACK = 'text';

export default class CodeBlock extends PureComponent<CodeBlockProps, {}> {
  static displayName = 'CodeBlock';

  static defaultProps = {
    showLineNumbers: true,
    language: LANGUAGE_FALLBACK,
    theme: {},
    highlight: '',
  };

  handleCopy = (event: any) => {
    /**
     * We don't want to copy the markup after highlighting, but rather the preformatted text in the selection
     */
    const data = event.nativeEvent.clipboardData;
    if (data) {
      event.preventDefault();
      const selection = window.getSelection();
      if (selection === null) {
        return;
      }
      const selectedText = selection.toString();
      const document = `<!doctype html><html><head></head><body><pre>${selectedText}</pre></body></html>`;
      data.clearData();
      data.setData('text/html', document);
      data.setData('text/plain', selectedText);
    }
  };

  render() {
    const {
      lineNumberContainerStyle,
      codeBlockStyle,
      codeContainerStyle,
    } = applyTheme(this.props.theme);

    const props = {
      language: normalizeLanguage(this.props.language || LANGUAGE_FALLBACK),
      codeStyle: codeBlockStyle,
      showLineNumbers: this.props.showLineNumbers,
      codeTagProps: { style: codeContainerStyle },
      lineNumberContainerStyle,
      text: this.props.text.toString(),
      highlight: this.props.highlight,
    };

    return <Code {...props} />;
  }
}
