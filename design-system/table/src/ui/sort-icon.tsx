/* eslint-disable no-unused-vars */
/** @jsx jsx */
import { FC, memo } from 'react';

import { jsx } from '@emotion/react';

import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';

import { useTable } from '../hooks/use-table';

/**
 * __SortIcon__
 *
 * SortIcon is used to display the sort state in our SortableColumn.
 */
export const SortIcon: FC<{ name: string }> = memo(({ name }) => {
  const { sortKey, sortDirection } = useTable();

  if (sortKey === name) {
    switch (sortDirection) {
      case 'ascending':
        return <ArrowUpIcon size="small" label="" primaryColor="inherit" />;
      case 'descending':
        return <ArrowDownIcon size="small" label="" primaryColor="inherit" />;
    }
  }

  return null;
});
