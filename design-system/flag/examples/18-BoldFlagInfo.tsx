import React from 'react';

import InfoIcon from '@atlaskit/icon/glyph/info';
import { colors } from '@atlaskit/theme';

import Flag from '../src';

export default () => (
  <Flag
    appearance="info"
    icon={<InfoIcon label="Info" secondaryColor={colors.N500} />}
    id="info"
    key="info"
    title="Connecting"
    description="We are talking to the interwebs, please hold."
    actions={[{ content: 'Good luck', onClick: () => {} }]}
    isDismissAllowed
  />
);
