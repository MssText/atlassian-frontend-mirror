import { BaseToken } from '../../palettes/typography/font-family';
import { FontFamilyTokenSchema, ValueSchema } from '../../types';

const font: ValueSchema<FontFamilyTokenSchema<BaseToken>> = {
  font: {
    family: {
      sans: { value: 'FontFamilySans' },
      monospace: { value: 'FontFamilyMonospace' },
    },
  },
};

export default font;
