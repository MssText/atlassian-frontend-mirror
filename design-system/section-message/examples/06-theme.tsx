import React, { useState } from 'react';

import Button from '@atlaskit/button';
import { AtlaskitThemeProvider } from '@atlaskit/theme/components';
import { gridSize } from '@atlaskit/theme/constants';
import type { ThemeModes } from '@atlaskit/theme/types';

import SectionMessage from '../src';

const LIGHT = 'light';
const DARK = 'dark';

export default function ThemeExample() {
  const [themeMode, setThemeMode] = useState<ThemeModes>(DARK);
  const toggleMode = () => {
    setThemeMode(themeMode === LIGHT ? DARK : LIGHT);
  };

  return (
    <AtlaskitThemeProvider mode={themeMode}>
      <SectionMessage
        testId="section-message"
        title="The Modern Prometheus"
        actions={[
          {
            key: 'mary',
            href: 'https://en.wikipedia.org/wiki/Mary_Shelley',
            text: 'Mary',
          },
          {
            key: 'villa',
            href: 'https://en.wikipedia.org/wiki/Villa_Diodati',
            text: 'Villa Diodatti',
          },
        ]}
      >
        <p>
          You will rejoice to hear that no disaster has accompanied the
          commencement of an enterprise which you have regarded with such evil
          forebodings. I arrived here yesterday, and my first task is to assure
          my dear sister of my welfare and increasing confidence in the success
          of my undertaking.
        </p>
      </SectionMessage>
      <SectionMessage
        appearance="change"
        title="The Modern Prometheus"
        actions={[
          {
            key: 'mary',
            href: 'https://en.wikipedia.org/wiki/Mary_Shelley',
            text: 'Mary',
          },
          {
            key: 'villa',
            href: 'https://en.wikipedia.org/wiki/Villa_Diodati',
            text: 'Villa Diodatti',
          },
        ]}
      >
        <p>
          You will rejoice to hear that no disaster has accompanied the
          commencement of an enterprise which you have regarded with such evil
          forebodings. I arrived here yesterday, and my first task is to assure
          my dear sister of my welfare and increasing confidence in the success
          of my undertaking.
        </p>
      </SectionMessage>
      <SectionMessage
        appearance="confirmation"
        title="The Modern Prometheus"
        actions={[
          {
            key: 'mary',
            href: 'https://en.wikipedia.org/wiki/Mary_Shelley',
            text: 'Mary',
          },
          {
            key: 'villa',
            href: 'https://en.wikipedia.org/wiki/Villa_Diodati',
            text: 'Villa Diodatti',
          },
        ]}
      >
        <p>
          You will rejoice to hear that no disaster has accompanied the
          commencement of an enterprise which you have regarded with such evil
          forebodings. I arrived here yesterday, and my first task is to assure
          my dear sister of my welfare and increasing confidence in the success
          of my undertaking.
        </p>
      </SectionMessage>
      <SectionMessage
        appearance="error"
        title="The Modern Prometheus"
        actions={[
          {
            key: 'mary',
            href: 'https://en.wikipedia.org/wiki/Mary_Shelley',
            text: 'Mary',
          },
          {
            key: 'villa',
            href: 'https://en.wikipedia.org/wiki/Villa_Diodati',
            text: 'Villa Diodatti',
          },
        ]}
      >
        <p>
          You will rejoice to hear that no disaster has accompanied the
          commencement of an enterprise which you have regarded with such evil
          forebodings. I arrived here yesterday, and my first task is to assure
          my dear sister of my welfare and increasing confidence in the success
          of my undertaking.
        </p>
      </SectionMessage>
      <SectionMessage
        appearance="warning"
        title="The Modern Prometheus"
        actions={[
          {
            key: 'mary',
            href: 'https://en.wikipedia.org/wiki/Mary_Shelley',
            text: 'Mary',
          },
          {
            key: 'villa',
            href: 'https://en.wikipedia.org/wiki/Villa_Diodati',
            text: 'Villa Diodatti',
          },
        ]}
      >
        <p>
          You will rejoice to hear that no disaster has accompanied the
          commencement of an enterprise which you have regarded with such evil
          forebodings. I arrived here yesterday, and my first task is to assure
          my dear sister of my welfare and increasing confidence in the success
          of my undertaking.
        </p>
      </SectionMessage>
      <div style={{ marginTop: gridSize() }}>
        <Button testId="toggle-theme" onClick={toggleMode}>
          Toggle theme
        </Button>
      </div>
    </AtlaskitThemeProvider>
  );
}
