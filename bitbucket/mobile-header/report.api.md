<!-- API Report Version: 2.3 -->

## API Report File for "@atlaskit/mobile-header"

> Do not edit this file. This report is auto-generated using [API Extractor](https://api-extractor.com/).
> [Learn more about API reports](https://hello.atlassian.net/wiki/spaces/UR/pages/1825484529/Package+API+Reports)

### Table of contents

- [Main Entry Types](#main-entry-types)
- [Peer Dependencies](#peer-dependencies)

### Main Entry Types

<!--SECTION START: Main Entry Types-->

```ts
import { PureComponent } from 'react';
import { default as React_2 } from 'react';
import { ReactNode } from 'react';

// @public (undocumented)
class MobileHeader extends PureComponent<MobileHeaderProps, MobileHeaderState> {
  // (undocumented)
  static defaultProps: {
    topOffset: number;
    pageHeading: string;
    menuIconLabel: string;
    drawerState: string;
  };
  // (undocumented)
  handleNavSlideFinish: () => void;
  // (undocumented)
  handleSidebarSlideFinish: () => void;
  // (undocumented)
  render(): JSX.Element;
  // (undocumented)
  renderSlider: (
    isOpen: boolean,
    isAnimating: boolean,
    onTransitionEnd:
      | ((event: React_2.TransitionEvent<HTMLDivElement>) => void)
      | undefined,
    side: string,
    renderFn?: ((isOpen: boolean) => ReactNode) | undefined,
    topOffset?: number | undefined,
  ) => JSX.Element;
  // (undocumented)
  state: {
    isAnimatingNavigation: boolean;
    isAnimatingSidebar: boolean;
  };
  // (undocumented)
  UNSAFE_componentWillReceiveProps(nextProps: MobileHeaderProps): void;
}
export default MobileHeader;

// @public (undocumented)
interface MobileHeaderProps {
  // (undocumented)
  customMenu?: ReactNode;
  // (undocumented)
  drawerState: 'navigation' | 'none' | 'sidebar' | string;
  // (undocumented)
  menuIconLabel: string;
  // (undocumented)
  navigation?: (isOpen: boolean) => ReactNode;
  // (undocumented)
  onDrawerClose?: () => void;
  // (undocumented)
  onNavigationOpen?: () => void;
  // (undocumented)
  pageHeading: ReactNode;
  // (undocumented)
  secondaryContent?: ReactNode;
  // (undocumented)
  sidebar?: (isOpen: boolean) => ReactNode;
  // (undocumented)
  topOffset?: number;
}

// @public (undocumented)
interface MobileHeaderState {
  // (undocumented)
  isAnimatingNavigation: boolean;
  // (undocumented)
  isAnimatingSidebar: boolean;
}

// (No @packageDocumentation comment for this package)
```

<!--SECTION END: Main Entry Types-->

### Peer Dependencies

<!--SECTION START: Peer Dependencies-->

```json
{
  "@emotion/react": "^11.0.0",
  "react": "^16.8.0"
}
```

<!--SECTION END: Peer Dependencies-->
