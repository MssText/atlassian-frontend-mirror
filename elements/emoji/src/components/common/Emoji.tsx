/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { MouseEvent, SyntheticEvent } from 'react';
import { shouldUseAltRepresentation } from '../../api/EmojiUtils';
import { deleteEmojiLabel } from '../../util/constants';
import {
  isImageRepresentation,
  isMediaRepresentation,
  isSpriteRepresentation,
  toEmojiId,
} from '../../util/type-helpers';
import {
  EmojiDescription,
  OnEmojiEvent,
  SpriteRepresentation,
} from '../../types';
import { leftClick } from '../../util/mouse';
import DeleteButton from './DeleteButton';
import {
  emojiContainer,
  emojiNodeStyles,
  commonSelectedStyles,
  selectOnHoverStyles,
  emojiSprite,
  emojiMainStyle,
  emojiStyles,
  emojiImage,
} from './styles';
import { sampledUfoRenderedEmoji } from '../../util/analytics';

export interface Props {
  /**
   * The emoji to render
   */
  emoji: EmojiDescription;

  /**
   * Show the emoji as selected
   */
  selected?: boolean;

  /**
   * Automatically show the emoji as selected based on mouse hover.
   *
   * CSS, fast, does not require a re-render, but selected state not
   * externally controlled via props.
   */
  selectOnHover?: boolean;

  /**
   * Called when an emoji is selected
   */
  onSelected?: OnEmojiEvent;

  /**
   * Called when the mouse moved over the emoji.
   */
  onMouseMove?: OnEmojiEvent;

  /**
   * Called when an emoji is deleted
   */
  onDelete?: OnEmojiEvent;

  /**
   * Callback for if an emoji image fails to load.
   */
  onLoadError?: OnEmojiEvent<HTMLImageElement>;

  /**
   * Additional css classes, if required.
   */
  className?: string;

  /**
   * Show a tooltip on mouse hover.
   */
  showTooltip?: boolean;

  /**
   * Show a delete button on mouse hover
   * Used only for custom emoji
   */
  showDelete?: boolean;

  /**
   * Fits emoji to height in pixels, keeping aspect ratio
   */
  fitToHeight?: number;

  shouldBeInteractive?: boolean;
}

const handleMouseDown = (props: Props, event: MouseEvent<any>) => {
  // Clicked emoji delete button
  if (
    event.target instanceof Element &&
    event.target.getAttribute('aria-label') === deleteEmojiLabel
  ) {
    return;
  }
  const { emoji, onSelected } = props;
  event.preventDefault();
  if (onSelected && leftClick(event)) {
    onSelected(toEmojiId(emoji), emoji, event);
  }
};

const handleKeyPress = (
  props: Props,
  event: React.KeyboardEvent<HTMLElement>,
) => {
  // Clicked emoji delete button
  if (
    event.target instanceof Element &&
    event.target.getAttribute('aria-label') === deleteEmojiLabel
  ) {
    return;
  }
  const { emoji, onSelected } = props;
  event.preventDefault();
  if (onSelected && (event.key === 'Enter' || event.key === ' ')) {
    onSelected(toEmojiId(emoji), emoji, event);
  }
};

const handleMouseMove = (props: Props, event: MouseEvent<any>) => {
  const { emoji, onMouseMove } = props;
  if (onMouseMove) {
    onMouseMove(toEmojiId(emoji), emoji, event);
  }
};

const handleDelete = (props: Props, event: SyntheticEvent) => {
  const { emoji, onDelete } = props;
  if (onDelete) {
    onDelete(toEmojiId(emoji), emoji, event);
  }
};

const handleImageError = (
  props: Props,
  event: SyntheticEvent<HTMLImageElement>,
) => {
  const { emoji, onLoadError } = props;

  // Hide error state (but keep space for it)
  if (event.target) {
    const target = event.target as HTMLElement;
    target.style.visibility = 'hidden';
  }
  if (onLoadError) {
    onLoadError(toEmojiId(emoji), emoji, event);
  }
};

// Pure functional components are used in favour of class based components, due to the performance!
// When rendering 1500+ emoji using class based components had a significant impact.
const renderAsSprite = (props: Props) => {
  const {
    emoji,
    fitToHeight,
    selected,
    selectOnHover,
    className,
    showTooltip,
    shouldBeInteractive,
  } = props;
  const representation = emoji.representation as SpriteRepresentation;
  const sprite = representation.sprite;

  const classes = `${emojiNodeStyles} ${selected ? commonSelectedStyles : ''} ${
    selectOnHover ? selectOnHoverStyles : ''
  } ${className ? className : ''}`;

  let sizing = {};
  if (fitToHeight) {
    sizing = {
      width: `${fitToHeight}px`,
      height: `${fitToHeight}px`,
      minHeight: `${fitToHeight}px`,
      minWidth: `${fitToHeight}px`,
    };
  }

  const xPositionInPercent =
    (100 / (sprite.column - 1)) * (representation.xIndex - 0);
  const yPositionInPercent =
    (100 / (sprite.row - 1)) * (representation.yIndex - 0);
  const style = {
    backgroundImage: `url(${sprite.url})`,
    backgroundPosition: `${xPositionInPercent}% ${yPositionInPercent}%`,
    backgroundSize: `${sprite.column * 100}% ${sprite.row * 100}%`,
    ...sizing,
  };
  const emojiNode = (
    <span className={emojiSprite} style={style}>
      &nbsp;
    </span>
  );

  return (
    <span
      tabIndex={shouldBeInteractive ? 0 : undefined}
      role={shouldBeInteractive ? 'button' : undefined}
      css={emojiContainer}
      className={classes}
      onKeyPress={(event) => handleKeyPress(props, event)}
      onMouseDown={(event) => {
        handleMouseDown(props, event);
      }}
      onMouseMove={(event) => {
        handleMouseMove(props, event);
      }}
      aria-label={emoji.shortName}
      title={showTooltip ? emoji.shortName : ''}
    >
      {emojiNode}
    </span>
  );
};

// Keep as pure functional component, see renderAsSprite.
const renderAsImage = (props: Props) => {
  const {
    emoji,
    fitToHeight,
    selected,
    selectOnHover,
    className,
    showTooltip,
    showDelete,
    shouldBeInteractive,
  } = props;

  const classes = `${emojiMainStyle} ${emojiNodeStyles} ${
    selected ? commonSelectedStyles : ''
  } ${selectOnHover ? selectOnHoverStyles : ''} ${emojiImage} ${
    className ? className : ''
  }`;

  let width;
  let height;
  let src;

  const representation = shouldUseAltRepresentation(emoji, fitToHeight)
    ? emoji.altRepresentation
    : emoji.representation;
  if (isImageRepresentation(representation)) {
    src = representation.imagePath;
    width = representation.width;
    height = representation.height;
  } else if (isMediaRepresentation(representation)) {
    src = representation.mediaPath;
    width = representation.width;
    height = representation.height;
  }

  let deleteButton;
  if (showDelete) {
    deleteButton = (
      <DeleteButton
        onClick={(event: SyntheticEvent) => handleDelete(props, event)}
      />
    );
  }

  let sizing = {};
  if (fitToHeight && width && height) {
    // Presize image, to prevent reflow due to size changes after loading
    sizing = {
      width: (fitToHeight / height) * width,
      height: fitToHeight,
    };
  }

  const onError = (event: SyntheticEvent<HTMLImageElement>) => {
    handleImageError(props, event);
  };

  const onLoad = () => {
    sampledUfoRenderedEmoji(emoji).success();
  };

  // Pass src attribute as key to force React to rerender img node since browser does not
  // change preview image until loaded

  // We currently have the following error: property 'loading' does not exist on type 'DetailedHTMLProps<ImgHTMLAttributes, HTMLImageElement>'
  // The fix for this was added as a part of @types/react@16.9.20 - https://github.com/facebook/react/issues/16942
  // TODO: remove @ts-ignore for the <img> below when the @types/react will be bumped from v16.8.0 to v16.9.20 or higher.
  const emojiNode = (
    <img
      // @ts-ignore
      loading="lazy"
      src={src}
      key={src}
      alt={emoji.shortName}
      data-emoji-short-name={emoji.shortName}
      data-emoji-id={emoji.id}
      data-emoji-text={emoji.fallback || emoji.shortName}
      className="emoji"
      style={{ visibility: 'visible' }}
      onError={onError}
      onLoad={onLoad}
      {...sizing}
    />
  );

  return (
    <span
      css={emojiStyles}
      tabIndex={shouldBeInteractive ? 0 : undefined}
      role={shouldBeInteractive ? 'button' : undefined}
      className={classes}
      onKeyPress={(event) => handleKeyPress(props, event)}
      onMouseDown={(event) => {
        handleMouseDown(props, event);
      }}
      onMouseMove={(event) => {
        handleMouseMove(props, event);
      }}
      aria-label={emoji.shortName}
      title={showTooltip ? emoji.shortName : ''}
    >
      {deleteButton}
      {emojiNode}
    </span>
  );
};

export const Emoji = (props: Props) => {
  const { emoji } = props;
  // TODO: We always prefer render as image as having accessibility issues with sprite representation
  if (isSpriteRepresentation(emoji.representation)) {
    return renderAsSprite(props);
  }
  return renderAsImage(props);
};

export default Emoji;
