/** @jsx jsx */
import { jsx } from '@emotion/react';
import LinkUrl from '../src/view/LinkUrl';

export default () => {
  return (
    <div css={{ margin: '50px auto', width: '50%' }}>
      <h1>{`<LinkURL />`}</h1>
      <p>
        <a
          href={
            'https://atlaskit.atlassian.com/packages/linking-platform/smart-card/docs/LinkUrl'
          }
          title={'LinkUrl documentation'}
        >
          Documentation
        </a>
      </p>
      <h2>Link safety warning</h2>
      <ul>
        <li>
          Link description is a URL and it's different from a destination.
          <br />
          <LinkUrl href="https://www.google.com/">atlassian.com</LinkUrl>
        </li>
      </ul>
      <h2>No link safety warning</h2>
      <ul>
        <li>
          Link description is a plain text.
          <br />
          <LinkUrl href="https://www.google.com/">
            Here is a google link
          </LinkUrl>
        </li>
        <li>
          Link description is a URL identical to a destination.
          <br />
          <LinkUrl href="https://www.atlassian.com/solutions/devops">
            https://www.atlassian.com/solutions/devops
          </LinkUrl>
        </li>
      </ul>
    </div>
  );
};
