"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _base = _interopRequireDefault(require("@atlaskit/icon/base"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CalendarIcon = props => /*#__PURE__*/_react.default.createElement(_base.default, Object.assign({
  dangerouslySetGlyph: `<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation"><path d="M4.995 5h14.01C20.107 5 21 5.895 21 6.994v12.012A1.994 1.994 0 0119.005 21H4.995A1.995 1.995 0 013 19.006V6.994C3 5.893 3.892 5 4.995 5zM5 9v9a1 1 0 001 1h12a1 1 0 001-1V9H5zm1-5a1 1 0 012 0v1H6V4zm10 0a1 1 0 012 0v1h-2V4zm-9 9v-2.001h2V13H7zm8 0v-2.001h2V13h-2zm-4 0v-2.001h2.001V13H11zm-4 4v-2h2v2H7zm4 0v-2h2.001v2H11zm4 0v-2h2v2h-2z" fill="currentColor" fill-rule="evenodd"/></svg>`
}, props));

CalendarIcon.displayName = 'CalendarIcon';
var _default = CalendarIcon;
exports.default = _default;