import type { BaseToken } from '../../../palettes/palette';
import type { ChartColorTokenSchema, ValueSchema } from '../../../types';

const color: ValueSchema<ChartColorTokenSchema<BaseToken>> = {
  color: {
    chart: {
      brand: {
        '[default]': {
          value: 'Blue600',
        },
        hovered: {
          value: 'Blue700',
        },
      },
      neutral: {
        '[default]': {
          value: 'Neutral500',
        },
        hovered: {
          value: 'Neutral600',
        },
      },
      success: {
        '[default]': {
          '[default]': {
            value: 'Green600',
          },
          hovered: {
            value: 'Green700',
          },
        },
        bold: {
          '[default]': {
            value: 'Green800',
          },
          hovered: {
            value: 'Green900',
          },
        },
      },
      danger: {
        '[default]': {
          '[default]': {
            value: 'Red500',
          },
          hovered: {
            value: 'Red600',
          },
        },
        bold: {
          '[default]': {
            value: 'Red800',
          },
          hovered: {
            value: 'Red900',
          },
        },
      },
      warning: {
        '[default]': {
          '[default]': {
            value: 'Yellow600',
          },
          hovered: {
            value: 'Yellow700',
          },
        },
        bold: {
          '[default]': {
            value: 'Yellow800',
          },
          hovered: {
            value: 'Yellow900',
          },
        },
      },
      information: {
        '[default]': {
          '[default]': {
            value: 'Blue500',
          },
          hovered: {
            value: 'Blue600',
          },
        },
        bold: {
          '[default]': {
            value: 'Blue800',
          },
          hovered: {
            value: 'Blue900',
          },
        },
      },
      discovery: {
        '[default]': {
          '[default]': {
            value: 'Purple500',
          },
          hovered: {
            value: 'Purple600',
          },
        },
        bold: {
          '[default]': {
            value: 'Purple800',
          },
          hovered: {
            value: 'Purple900',
          },
        },
      },
      categorical: {
        1: {
          '[default]': {
            value: 'Teal600',
          },
          hovered: {
            value: 'Teal700',
          },
        },
        2: {
          '[default]': {
            value: 'Purple800',
          },
          hovered: {
            value: 'Purple900',
          },
        },
        3: {
          '[default]': {
            value: 'Orange600',
          },
          hovered: {
            value: 'Orange700',
          },
        },
        4: {
          '[default]': {
            value: 'Magenta800',
          },
          hovered: {
            value: 'Magenta900',
          },
        },
        5: {
          '[default]': {
            value: 'Blue900',
          },
          hovered: {
            value: 'Blue1000',
          },
        },
        6: {
          '[default]': {
            value: 'Purple500',
          },
          hovered: {
            value: 'Purple600',
          },
        },
        7: {
          '[default]': {
            value: 'Magenta900',
          },
          hovered: {
            value: 'Magenta1000',
          },
        },
        8: {
          '[default]': {
            value: 'Orange800',
          },
          hovered: {
            value: 'Orange900',
          },
        },
      },
      blue: {
        bold: {
          '[default]': {
            value: 'Blue500',
          },
          hovered: {
            value: 'Blue600',
          },
        },
        bolder: {
          '[default]': {
            value: 'Blue600',
          },
          hovered: {
            value: 'Blue700',
          },
        },
        boldest: {
          '[default]': {
            value: 'Blue800',
          },
          hovered: {
            value: 'Blue900',
          },
        },
      },
      red: {
        bold: {
          '[default]': {
            value: 'Red500',
          },
          hovered: {
            value: 'Red600',
          },
        },
        bolder: {
          '[default]': {
            value: 'Red600',
          },
          hovered: {
            value: 'Red700',
          },
        },
        boldest: {
          '[default]': {
            value: 'Red800',
          },
          hovered: {
            value: 'Red900',
          },
        },
      },
      orange: {
        bold: {
          '[default]': {
            value: 'Orange600',
          },
          hovered: {
            value: 'Orange700',
          },
        },
        bolder: {
          '[default]': {
            value: 'Orange700',
          },
          hovered: {
            value: 'Orange800',
          },
        },
        boldest: {
          '[default]': {
            value: 'Orange800',
          },
          hovered: {
            value: 'Orange900',
          },
        },
      },
      yellow: {
        bold: {
          '[default]': {
            value: 'Yellow600',
          },
          hovered: {
            value: 'Yellow700',
          },
        },
        bolder: {
          '[default]': {
            value: 'Yellow700',
          },
          hovered: {
            value: 'Yellow800',
          },
        },
        boldest: {
          '[default]': {
            value: 'Yellow800',
          },
          hovered: {
            value: 'Yellow900',
          },
        },
      },
      green: {
        bold: {
          '[default]': {
            value: 'Green600',
          },
          hovered: {
            value: 'Green700',
          },
        },
        bolder: {
          '[default]': {
            value: 'Green700',
          },
          hovered: {
            value: 'Green800',
          },
        },
        boldest: {
          '[default]': {
            value: 'Green800',
          },
          hovered: {
            value: 'Green900',
          },
        },
      },
      teal: {
        bold: {
          '[default]': {
            value: 'Teal600',
          },
          hovered: {
            value: 'Teal700',
          },
        },
        bolder: {
          '[default]': {
            value: 'Teal700',
          },
          hovered: {
            value: 'Teal800',
          },
        },
        boldest: {
          '[default]': {
            value: 'Teal800',
          },
          hovered: {
            value: 'Teal900',
          },
        },
      },
      purple: {
        bold: {
          '[default]': {
            value: 'Purple500',
          },
          hovered: {
            value: 'Purple600',
          },
        },
        bolder: {
          '[default]': {
            value: 'Purple600',
          },
          hovered: {
            value: 'Purple700',
          },
        },
        boldest: {
          '[default]': {
            value: 'Purple800',
          },
          hovered: {
            value: 'Purple900',
          },
        },
      },
      magenta: {
        bold: {
          '[default]': {
            value: 'Magenta500',
          },
          hovered: {
            value: 'Magenta600',
          },
        },
        bolder: {
          '[default]': {
            value: 'Magenta600',
          },
          hovered: {
            value: 'Magenta700',
          },
        },
        boldest: {
          '[default]': {
            value: 'Magenta800',
          },
          hovered: {
            value: 'Magenta900',
          },
        },
      },
      gray: {
        bold: {
          '[default]': {
            value: 'Neutral500',
          },
          hovered: {
            value: 'Neutral600',
          },
        },
        bolder: {
          '[default]': {
            value: 'Neutral600',
          },
          hovered: {
            value: 'Neutral700',
          },
        },
        boldest: {
          '[default]': {
            value: 'Neutral800',
          },
          hovered: {
            value: 'Neutral900',
          },
        },
      },
    },
  },
};

export default color;
