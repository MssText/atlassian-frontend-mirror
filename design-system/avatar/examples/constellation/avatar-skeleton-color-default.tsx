import React from 'react';

// AFP-2532 TODO: Fix automatic suppressions below
// eslint-disable-next-line @atlassian/tangerine/import/entry-points
import { colors } from '@atlaskit/theme';

import { Skeleton } from '../../src';

export default function AvatarSkeletonColorDefaultExample() {
  return (
    <div style={{ color: colors.P500 }}>
      <Skeleton />
    </div>
  );
}
