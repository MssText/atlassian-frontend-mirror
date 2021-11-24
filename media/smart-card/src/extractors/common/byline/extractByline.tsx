import React from 'react';
import { JsonLd } from 'json-ld-types';
import { FormattedRelativeTime } from 'react-intl-next';

import { selectUnit } from '@formatjs/intl-utils';

import {
  extractPersonUpdatedBy,
  LinkTypeUpdatedBy,
} from '../person/extractPersonUpdatedBy';
import { extractPersonCreatedBy } from '../person/extractPersonCreatedBy';
import {
  extractDateCreated,
  LinkTypeCreated,
} from '../date/extractDateCreated';
import { extractDateUpdated } from '../date/extractDateUpdated';
import { LinkPerson } from '../person';

export const extractByline = (
  jsonLd: JsonLd.Data.BaseData,
): React.ReactNode | undefined => {
  const updatedAt = extractDateUpdated(jsonLd);
  const createdAt = extractDateCreated(jsonLd as LinkTypeCreated);

  if (updatedAt) {
    const { value, unit } = selectUnit(new Date(updatedAt).getTime());
    const updatedBy = extractPersonUpdatedBy(jsonLd as LinkTypeUpdatedBy);
    return (
      <span>
        Updated {updatedBy && `by ${updatedBy.name}`}{' '}
        <FormattedRelativeTime value={value} unit={unit} />
      </span>
    );
  } else if (createdAt) {
    const { value, unit } = selectUnit(new Date(createdAt).getTime());
    const createdBy = extractPersonCreatedBy(jsonLd);
    const createdByPerson = extractFirstPerson(createdBy);
    return (
      <span>
        Created {createdByPerson && `by ${createdByPerson.name}`}{' '}
        <FormattedRelativeTime value={value} unit={unit} />
      </span>
    );
  }
};

const extractFirstPerson = (persons?: LinkPerson[]): LinkPerson | undefined => {
  if (persons && persons.length > 0) {
    return persons.shift()!;
  }
};
