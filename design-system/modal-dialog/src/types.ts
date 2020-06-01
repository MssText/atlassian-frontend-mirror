import React from 'react';

import { ButtonProps } from '@atlaskit/button';

export type KeyboardOrMouseEvent =
  | React.MouseEvent<any>
  | React.KeyboardEvent<any>;
export type AppearanceType = 'danger' | 'warning';

export type ScrollBehavior = 'inside' | 'outside' | 'inside-wide';

export type ActionProps = ButtonProps & {
  // ReactNode provides support for i18n libraries
  text: React.ReactNode;
};
