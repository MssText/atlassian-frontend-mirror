import React, { Fragment } from 'react';

import { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { StringField, NumberField } from '@atlaskit/editor-common/extensions';

import FieldMessages from '../FieldMessages';
import { validate } from '../utils';
import { OnBlur } from '../types';

export default function({
  field,
  type,
  autoFocus,
  onBlur,
}: {
  field: StringField | NumberField;
  type: 'number' | 'text';
  autoFocus?: boolean;
  onBlur: OnBlur;
}) {
  const element = (
    <Field
      name={field.name}
      label={field.label}
      defaultValue={field.defaultValue || ''}
      isRequired={field.isRequired}
      validate={(value?: string) => validate<string>(field, value || '')}
    >
      {({ fieldProps, error, valid }) => (
        <Fragment>
          <TextField
            {...fieldProps}
            autoFocus={autoFocus}
            onBlur={() => {
              fieldProps.onBlur();
              onBlur(field.name);
            }}
            type={type}
          />
          <FieldMessages error={error} description={field.description} />
        </Fragment>
      )}
    </Field>
  );

  if (field.isHidden) {
    return <div style={{ display: 'none' }}>{element}</div>;
  }

  return element;
}
