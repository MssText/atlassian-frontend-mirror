import React from 'react';

import { CodeBlock } from '../../src';

const exampleCodeBlock = `// React Component
class HelloMessage extends React.Component {
  render() {
    return (
      <div>
        Hello {this.props.name}
      </div>
    );
  }
}

ReactDOM.render(
  <HelloMessage name="Taylor" />,
  mountNode
);
`;

export default function CodeBlockDefaultExample() {
  return (
    <CodeBlock
      language="javascript"
      showLineNumbers={false}
      text={exampleCodeBlock}
    />
  );
}
