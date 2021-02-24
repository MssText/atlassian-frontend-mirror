/* eslint-disable max-len */
import React, { Component } from 'react';

import { DefaultProps, Props } from '../constants';
import Wrapper from '../Wrapper';

const svg = `<canvas height="32" width="148" aria-hidden="true"></canvas>
<svg viewBox="0 0 148 32" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
  <g stroke="none" stroke-width="1" fill-rule="evenodd" fill="inherit">
    <path d="M5.07,18.956 C5.07,20.646 4.394,21.842 2.418,21.842 C1.56,21.842 0.702,21.686 1.99840144e-15,21.4 L1.99840144e-15,23.662 C0.65,23.896 1.586,24.104 2.808,24.104 C6.032,24.104 7.41,21.946 7.41,18.8 L7.41,6.918 L5.07,6.918 L5.07,18.956 Z M10.894,7.568 C10.894,8.556 11.544,9.128 12.454,9.128 C13.364,9.128 14.014,8.556 14.014,7.568 C14.014,6.58 13.364,6.008 12.454,6.008 C11.544,6.008 10.894,6.58 10.894,7.568 Z M11.31,24 L13.546,24 L13.546,11 L11.31,11 L11.31,24 Z M16.926,24 L19.11,24 L19.11,16.33 C19.11,13.574 20.852,12.716 23.712,13.002 L23.712,10.818 C21.164,10.662 19.864,11.754 19.11,13.288 L19.11,11 L16.926,11 L16.926,24 Z M34.45,24 L34.45,21.66 C33.618,23.376 32.058,24.26 30.056,24.26 C26.598,24.26 24.856,21.322 24.856,17.5 C24.856,13.834 26.676,10.74 30.316,10.74 C32.214,10.74 33.67,11.598 34.45,13.288 L34.45,11 L36.686,11 L36.686,24 L34.45,24 Z M27.092,17.5 C27.092,20.62 28.34,22.18 30.654,22.18 C32.656,22.18 34.45,20.906 34.45,18.02 L34.45,16.98 C34.45,14.094 32.812,12.82 30.914,12.82 C28.392,12.82 27.092,14.484 27.092,17.5 Z M55.926,19.294 C55.926,16.226 53.898,15.056 50.284,14.146 C47.268,13.392 46.176,12.69 46.176,11.286 C46.176,9.726 47.502,8.946 49.738,8.946 C51.506,8.946 53.352,9.258 55.068,10.246 L55.068,7.906 C53.898,7.256 52.312,6.658 49.842,6.658 C45.864,6.658 43.836,8.634 43.836,11.286 C43.836,14.094 45.552,15.42 49.4,16.356 C52.65,17.136 53.586,17.942 53.586,19.45 C53.586,20.958 52.624,21.972 50.05,21.972 C47.788,21.972 45.344,21.374 43.758,20.542 L43.758,22.934 C45.084,23.61 46.618,24.26 49.92,24.26 C54.158,24.26 55.926,22.258 55.926,19.294 Z M64.09,24.26 C60.19,24.26 57.902,21.374 57.902,17.474 C57.902,13.574 60.19,10.74 64.09,10.74 C67.964,10.74 70.226,13.574 70.226,17.474 C70.226,21.374 67.964,24.26 64.09,24.26 Z M64.09,12.82 C61.308,12.82 60.086,15.004 60.086,17.474 C60.086,19.944 61.308,22.18 64.09,22.18 C66.846,22.18 68.042,19.944 68.042,17.474 C68.042,15.004 66.846,12.82 64.09,12.82 Z M75.92,9.622 C75.92,8.452 76.596,7.646 77.974,7.646 C78.494,7.646 78.988,7.698 79.378,7.776 L79.378,5.722 C78.988,5.618 78.546,5.514 77.87,5.514 C75.088,5.514 73.736,7.152 73.736,9.57 L73.736,11 L71.63,11 L71.63,13.08 L73.736,13.08 L73.736,24 L75.92,24 L75.92,13.08 L79.274,13.08 L79.274,11 L75.92,11 L75.92,9.622 Z M84.786,19.892 L84.786,13.08 L88.244,13.08 L88.244,11 L84.786,11 L84.786,8.244 L82.602,8.244 L82.602,11 L80.496,11 L80.496,13.08 L82.602,13.08 L82.602,19.944 C82.602,22.362 83.954,24 86.736,24 C87.412,24 87.854,23.896 88.244,23.792 L88.244,21.634 C87.854,21.712 87.36,21.816 86.84,21.816 C85.462,21.816 84.786,21.036 84.786,19.892 Z M94.432,24 L97.292,24 L99.528,17.708 L100.724,13.704 L101.92,17.708 L104.156,24 L107.016,24 L111.8,11 L109.33,11 L105.586,22.024 L101.79,11 L99.658,11 L95.862,22.024 L92.118,11 L89.648,11 L94.432,24 Z M122.538,24 L122.538,21.66 C121.706,23.376 120.146,24.26 118.144,24.26 C114.686,24.26 112.944,21.322 112.944,17.5 C112.944,13.834 114.764,10.74 118.404,10.74 C120.302,10.74 121.758,11.598 122.538,13.288 L122.538,11 L124.774,11 L124.774,24 L122.538,24 Z M115.18,17.5 C115.18,20.62 116.428,22.18 118.742,22.18 C120.744,22.18 122.538,20.906 122.538,18.02 L122.538,16.98 C122.538,14.094 120.9,12.82 119.002,12.82 C116.48,12.82 115.18,14.484 115.18,17.5 Z M128.154,24 L130.338,24 L130.338,16.33 C130.338,13.574 132.08,12.716 134.94,13.002 L134.94,10.818 C132.392,10.662 131.092,11.754 130.338,13.288 L130.338,11 L128.154,11 L128.154,24 Z M147.108,23.48 C146.042,24.052 144.404,24.26 143.078,24.26 C138.216,24.26 136.084,21.452 136.084,17.474 C136.084,13.548 138.268,10.74 142.22,10.74 C146.224,10.74 147.836,13.522 147.836,17.474 L147.836,18.488 L138.346,18.488 C138.658,20.698 140.088,22.128 143.156,22.128 C144.664,22.128 145.938,21.842 147.108,21.426 L147.108,23.48 Z M142.116,12.768 C139.75,12.768 138.554,14.302 138.32,16.564 L145.574,16.564 C145.444,14.146 144.352,12.768 142.116,12.768 Z"></path>
  </g>
</svg>`;

export class JiraSoftwareWordmark extends Component<Props> {
  static defaultProps = DefaultProps;

  render() {
    return <Wrapper {...this.props} svg={svg} />;
  }
}
