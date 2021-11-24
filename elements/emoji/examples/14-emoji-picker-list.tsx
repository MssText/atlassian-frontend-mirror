import React from 'react';
import classNames from 'classnames';
import { getEmojis } from '@atlaskit/util-data-test/get-emojis';
import EmojiPickerList from '../src/components/picker/EmojiPickerList';

import * as styles from '../src/components/picker/styles';
import { IntlProvider } from 'react-intl-next';

const allEmojis = getEmojis();

export default function Example() {
  const [query, setQuery] = React.useState('');
  const [emojis, setEmojis] = React.useState(allEmojis);

  const onSearch = (value: string) => {
    setQuery(value);

    setEmojis(
      value.length === 0
        ? allEmojis
        : allEmojis.filter(
            (emoji) =>
              emoji.shortName.toLowerCase().indexOf(query.toLowerCase()) > -1,
          ),
    );
  };

  return (
    <IntlProvider locale="en">
      <div className={classNames([styles.emojiPicker])}>
        <EmojiPickerList emojis={emojis} query={query} onSearch={onSearch} />
      </div>
    </IntlProvider>
  );
}
