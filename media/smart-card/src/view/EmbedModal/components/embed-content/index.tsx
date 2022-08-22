/** @jsx jsx */
import { FC } from 'react';
import { css, jsx } from '@emotion/core';
import { getIframeSandboxAttribute } from '../../../../utils';
import { EmbedProps } from './types';

const iframeCss = css`
  width: 100%;
  height: calc(100vh - 214px);
`;

const EmbedContent: FC<EmbedProps> = ({ isTrusted, name, src, testId }) => {
  const sandbox = getIframeSandboxAttribute(isTrusted);
  const props = {
    css: iframeCss,
    frameBorder: 0,
    name,
    sandbox,
    src,
    'data-testid': `${testId}-embed`,
  };
  return src ? <iframe src={src} {...props} /> : <iframe {...props} />;
};

export default EmbedContent;
