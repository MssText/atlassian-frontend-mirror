/** @jsx jsx */
import { memo } from 'react';

import { jsx } from '@emotion/core';

import Button from '@atlaskit/button/standard-button';

import { actionStyle } from './internal/styles';
import type { SectionMessageActionProps } from './types';

const SectionMessageAction = memo(function SectionMessageAction({
  text,
  onClick,
  href,
  testId,
  linkComponent,
}: SectionMessageActionProps) {
  return (
    <li css={actionStyle} data-testid={testId}>
      {onClick || href ? (
        <Button
          appearance="link"
          spacing="none"
          onClick={onClick}
          href={href}
          component={href ? linkComponent : undefined}
        >
          {text}
        </Button>
      ) : (
        text
      )}
    </li>
  );
});

SectionMessageAction.displayName = 'SectionMessageAction';

export default SectionMessageAction;
