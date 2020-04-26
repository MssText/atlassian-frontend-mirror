import React from 'react';

import { code, Example, md, Props } from '@atlaskit/docs';

export default md`
  Useful when wanting to create a item using a your own component that inherits the look and feel of a menu item.
  Use cases could include using your own router link component for example.

  Your custom component will be given all overflow props passed to the custom item component,
  as well as when using TypeScript will add the custom component props to the root component props type for type safety.

  ${code`
import { CustomItem, CustomItemComponentProps } from '@atlaskit/menu';

const Container = (props: CustomItemComponentProps) => {
  return <span {...props}>{children}</span>;
};

<CustomItem component={Component}>View articles</CustomItem>
  `}

${(
  <Example
    title="Custom item"
    Component={require('../examples/custom-item.tsx').default}
    source={require('!!raw-loader!../examples/custom-item.tsx')}
  />
)}

${(
  <Props
    heading="Props"
    props={require('!!extract-react-types-loader!../src/components/item/custom-item-hack-for-ert.tsx')}
  />
)}
`;
