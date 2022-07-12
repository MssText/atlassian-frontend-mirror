/** @jsx jsx */
import React from 'react';

import { css, jsx, SerializedStyles } from '@emotion/core';

import { BlockProps } from '../types';
import {
  ElementName,
  SmartLinkDirection,
  SmartLinkSize,
} from '../../../../../constants';
import { getBaseStyles, getGapSize, renderChildren } from '../utils';

const getBlockStyles = (
  direction: SmartLinkDirection,
  size: SmartLinkSize,
): SerializedStyles => css`
  ${getBaseStyles(direction, size)}
  justify-content: flex-start;
  [data-separator] + [data-separator]:before {
    content: '•';
    margin-right: ${getGapSize(size)}rem;
  }
  // Pull request elements: source branch → target branch
  [data-smart-element='${ElementName.SourceBranch}']
    + [data-smart-element='${ElementName.TargetBranch}']:before {
    content: '→';
  }
  // Pull request elements: target branch ← source branch
  [data-smart-element='${ElementName.TargetBranch}']
    + [data-smart-element='${ElementName.SourceBranch}']:before {
    content: '←';
  }
`;

/**
 * A block represents a collection of elements and actions that are arranged
 * in a row. All elements and actions should be contained within a Block.
 * @internal
 * @param {ActionGroupProps} ActionGroupProps
 * @see Action
 */
const Block: React.FC<BlockProps> = ({
  children,
  direction = SmartLinkDirection.Horizontal,
  size = SmartLinkSize.Medium,
  testId = 'smart-block',
  overrideCss,
}) => (
  <div
    css={[getBlockStyles(direction, size), overrideCss]}
    data-smart-block
    data-testid={testId}
  >
    {renderChildren(children, size)}
  </div>
);

export default Block;
