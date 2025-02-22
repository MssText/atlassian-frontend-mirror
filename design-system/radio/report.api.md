<!-- API Report Version: 2.3 -->

## API Report File for "@atlaskit/radio"

> Do not edit this file. This report is auto-generated using [API Extractor](https://api-extractor.com/).
> [Learn more about API reports](https://hello.atlassian.net/wiki/spaces/UR/pages/1825484529/Package+API+Reports)

### Table of contents

- [Main Entry Types](#main-entry-types)
- [Peer Dependencies](#peer-dependencies)

### Main Entry Types

<!--SECTION START: Main Entry Types-->

```ts
/// <reference types="react" />

import { ChangeEvent } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { InputHTMLAttributes } from 'react';
import { MemoExoticComponent } from 'react';
import { default as React_2 } from 'react';
import { ReactNode } from 'react';
import { RefAttributes } from 'react';
import { SyntheticEvent } from 'react';
import { UIAnalyticsEvent } from '@atlaskit/analytics-next';
import { WithAnalyticsEventsProps } from '@atlaskit/analytics-next';

// @public (undocumented)
type OptionPropType = {
  isDisabled?: boolean;
  label?: ReactNode;
  name?: string;
  value?: RadioValue;
  testId?: string;
};

// @public (undocumented)
type OptionsPropType = Array<OptionPropType>;

// @public
export const Radio: MemoExoticComponent<
  ForwardRefExoticComponent<
    Pick<
      Omit<
        Omit<
          InputHTMLAttributes<HTMLInputElement>,
          'aria-label' | 'checked' | 'disabled' | 'required' | 'value'
        >,
        keyof {
          ariaLabel?: string | undefined;
          isDisabled?: boolean | undefined;
          isRequired?: boolean | undefined;
          isInvalid?: boolean | undefined;
          isChecked?: boolean | undefined;
          label?: ReactNode;
          onChange?:
            | ((
                e: ChangeEvent<HTMLInputElement>,
                analyticsEvent: UIAnalyticsEvent,
              ) => void)
            | undefined;
          value?: string | undefined;
          testId?: string | undefined;
          analyticsContext?: Record<string, any> | undefined;
        }
      > & {
        ariaLabel?: string | undefined;
        isDisabled?: boolean | undefined;
        isRequired?: boolean | undefined;
        isInvalid?: boolean | undefined;
        isChecked?: boolean | undefined;
        label?: ReactNode;
        onChange?:
          | ((
              e: ChangeEvent<HTMLInputElement>,
              analyticsEvent: UIAnalyticsEvent,
            ) => void)
          | undefined;
        value?: string | undefined;
        testId?: string | undefined;
        analyticsContext?: Record<string, any> | undefined;
      } & WithAnalyticsEventsProps,
      | 'about'
      | 'accept'
      | 'accessKey'
      | 'alt'
      | 'aria-activedescendant'
      | 'aria-atomic'
      | 'aria-autocomplete'
      | 'aria-busy'
      | 'aria-checked'
      | 'aria-colcount'
      | 'aria-colindex'
      | 'aria-colspan'
      | 'aria-controls'
      | 'aria-current'
      | 'aria-describedby'
      | 'aria-details'
      | 'aria-disabled'
      | 'aria-dropeffect'
      | 'aria-errormessage'
      | 'aria-expanded'
      | 'aria-flowto'
      | 'aria-grabbed'
      | 'aria-haspopup'
      | 'aria-hidden'
      | 'aria-invalid'
      | 'aria-keyshortcuts'
      | 'aria-labelledby'
      | 'aria-level'
      | 'aria-live'
      | 'aria-modal'
      | 'aria-multiline'
      | 'aria-multiselectable'
      | 'aria-orientation'
      | 'aria-owns'
      | 'aria-placeholder'
      | 'aria-posinset'
      | 'aria-pressed'
      | 'aria-readonly'
      | 'aria-relevant'
      | 'aria-required'
      | 'aria-roledescription'
      | 'aria-rowcount'
      | 'aria-rowindex'
      | 'aria-rowspan'
      | 'aria-selected'
      | 'aria-setsize'
      | 'aria-sort'
      | 'aria-valuemax'
      | 'aria-valuemin'
      | 'aria-valuenow'
      | 'aria-valuetext'
      | 'autoCapitalize'
      | 'autoComplete'
      | 'autoCorrect'
      | 'autoFocus'
      | 'autoSave'
      | 'capture'
      | 'children'
      | 'className'
      | 'color'
      | 'contentEditable'
      | 'contextMenu'
      | 'createAnalyticsEvent'
      | 'crossOrigin'
      | 'dangerouslySetInnerHTML'
      | 'datatype'
      | 'defaultChecked'
      | 'defaultValue'
      | 'dir'
      | 'draggable'
      | 'form'
      | 'formAction'
      | 'formEncType'
      | 'formMethod'
      | 'formNoValidate'
      | 'formTarget'
      | 'height'
      | 'hidden'
      | 'id'
      | 'inlist'
      | 'inputMode'
      | 'is'
      | 'itemID'
      | 'itemProp'
      | 'itemRef'
      | 'itemScope'
      | 'itemType'
      | 'lang'
      | 'list'
      | 'max'
      | 'maxLength'
      | 'min'
      | 'minLength'
      | 'multiple'
      | 'name'
      | 'onAbort'
      | 'onAbortCapture'
      | 'onAnimationEnd'
      | 'onAnimationEndCapture'
      | 'onAnimationIteration'
      | 'onAnimationIterationCapture'
      | 'onAnimationStart'
      | 'onAnimationStartCapture'
      | 'onAuxClick'
      | 'onAuxClickCapture'
      | 'onBeforeInput'
      | 'onBeforeInputCapture'
      | 'onBlur'
      | 'onBlurCapture'
      | 'onCanPlay'
      | 'onCanPlayCapture'
      | 'onCanPlayThrough'
      | 'onCanPlayThroughCapture'
      | 'onChangeCapture'
      | 'onClick'
      | 'onClickCapture'
      | 'onCompositionEnd'
      | 'onCompositionEndCapture'
      | 'onCompositionStart'
      | 'onCompositionStartCapture'
      | 'onCompositionUpdate'
      | 'onCompositionUpdateCapture'
      | 'onContextMenu'
      | 'onContextMenuCapture'
      | 'onCopy'
      | 'onCopyCapture'
      | 'onCut'
      | 'onCutCapture'
      | 'onDoubleClick'
      | 'onDoubleClickCapture'
      | 'onDrag'
      | 'onDragCapture'
      | 'onDragEnd'
      | 'onDragEndCapture'
      | 'onDragEnter'
      | 'onDragEnterCapture'
      | 'onDragExit'
      | 'onDragExitCapture'
      | 'onDragLeave'
      | 'onDragLeaveCapture'
      | 'onDragOver'
      | 'onDragOverCapture'
      | 'onDragStart'
      | 'onDragStartCapture'
      | 'onDrop'
      | 'onDropCapture'
      | 'onDurationChange'
      | 'onDurationChangeCapture'
      | 'onEmptied'
      | 'onEmptiedCapture'
      | 'onEncrypted'
      | 'onEncryptedCapture'
      | 'onEnded'
      | 'onEndedCapture'
      | 'onError'
      | 'onErrorCapture'
      | 'onFocus'
      | 'onFocusCapture'
      | 'onGotPointerCapture'
      | 'onGotPointerCaptureCapture'
      | 'onInput'
      | 'onInputCapture'
      | 'onInvalid'
      | 'onInvalidCapture'
      | 'onKeyDown'
      | 'onKeyDownCapture'
      | 'onKeyPress'
      | 'onKeyPressCapture'
      | 'onKeyUp'
      | 'onKeyUpCapture'
      | 'onLoad'
      | 'onLoadCapture'
      | 'onLoadStart'
      | 'onLoadStartCapture'
      | 'onLoadedData'
      | 'onLoadedDataCapture'
      | 'onLoadedMetadata'
      | 'onLoadedMetadataCapture'
      | 'onLostPointerCapture'
      | 'onLostPointerCaptureCapture'
      | 'onMouseDown'
      | 'onMouseDownCapture'
      | 'onMouseEnter'
      | 'onMouseLeave'
      | 'onMouseMove'
      | 'onMouseMoveCapture'
      | 'onMouseOut'
      | 'onMouseOutCapture'
      | 'onMouseOver'
      | 'onMouseOverCapture'
      | 'onMouseUp'
      | 'onMouseUpCapture'
      | 'onPaste'
      | 'onPasteCapture'
      | 'onPause'
      | 'onPauseCapture'
      | 'onPlay'
      | 'onPlayCapture'
      | 'onPlaying'
      | 'onPlayingCapture'
      | 'onPointerCancel'
      | 'onPointerCancelCapture'
      | 'onPointerDown'
      | 'onPointerDownCapture'
      | 'onPointerEnter'
      | 'onPointerEnterCapture'
      | 'onPointerLeave'
      | 'onPointerLeaveCapture'
      | 'onPointerMove'
      | 'onPointerMoveCapture'
      | 'onPointerOut'
      | 'onPointerOutCapture'
      | 'onPointerOver'
      | 'onPointerOverCapture'
      | 'onPointerUp'
      | 'onPointerUpCapture'
      | 'onProgress'
      | 'onProgressCapture'
      | 'onRateChange'
      | 'onRateChangeCapture'
      | 'onReset'
      | 'onResetCapture'
      | 'onScroll'
      | 'onScrollCapture'
      | 'onSeeked'
      | 'onSeekedCapture'
      | 'onSeeking'
      | 'onSeekingCapture'
      | 'onSelect'
      | 'onSelectCapture'
      | 'onStalled'
      | 'onStalledCapture'
      | 'onSubmit'
      | 'onSubmitCapture'
      | 'onSuspend'
      | 'onSuspendCapture'
      | 'onTimeUpdate'
      | 'onTimeUpdateCapture'
      | 'onTouchCancel'
      | 'onTouchCancelCapture'
      | 'onTouchEnd'
      | 'onTouchEndCapture'
      | 'onTouchMove'
      | 'onTouchMoveCapture'
      | 'onTouchStart'
      | 'onTouchStartCapture'
      | 'onTransitionEnd'
      | 'onTransitionEndCapture'
      | 'onVolumeChange'
      | 'onVolumeChangeCapture'
      | 'onWaiting'
      | 'onWaitingCapture'
      | 'onWheel'
      | 'onWheelCapture'
      | 'pattern'
      | 'placeholder'
      | 'prefix'
      | 'property'
      | 'radioGroup'
      | 'readOnly'
      | 'resource'
      | 'results'
      | 'role'
      | 'security'
      | 'size'
      | 'slot'
      | 'spellCheck'
      | 'src'
      | 'step'
      | 'style'
      | 'suppressContentEditableWarning'
      | 'suppressHydrationWarning'
      | 'tabIndex'
      | 'title'
      | 'type'
      | 'typeof'
      | 'unselectable'
      | 'vocab'
      | 'width'
      | keyof {
          ariaLabel?: string | undefined;
          isDisabled?: boolean | undefined;
          isRequired?: boolean | undefined;
          isInvalid?: boolean | undefined;
          isChecked?: boolean | undefined;
          label?: ReactNode;
          onChange?:
            | ((
                e: ChangeEvent<HTMLInputElement>,
                analyticsEvent: UIAnalyticsEvent,
              ) => void)
            | undefined;
          value?: string | undefined;
          testId?: string | undefined;
          analyticsContext?: Record<string, any> | undefined;
        }
    > &
      RefAttributes<HTMLInputElement>
  >
>;

// @public (undocumented)
export function RadioGroup(props: RadioGroupProps): JSX.Element;

// @public (undocumented)
interface RadioGroupProps {
  'aria-labelledby'?: string;
  analyticsContext?: Record<string, any>;
  defaultValue?: RadioValue | null;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  name?: string;
  onChange?: (
    e: React_2.ChangeEvent<HTMLInputElement>,
    analyticsEvent: UIAnalyticsEvent,
  ) => void;
  onInvalid?: (event: SyntheticEvent<any>) => void;
  options: OptionsPropType;
  value?: RadioValue | null;
}

// @public (undocumented)
type RadioValue = string;

// (No @packageDocumentation comment for this package)
```

<!--SECTION END: Main Entry Types-->

### Peer Dependencies

<!--SECTION START: Peer Dependencies-->

```json
{
  "react": "^16.8.0"
}
```

<!--SECTION END: Peer Dependencies-->
