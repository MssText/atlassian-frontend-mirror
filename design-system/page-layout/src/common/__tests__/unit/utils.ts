import {
  getGridStateFromStorage,
  mergeGridStateIntoStorage,
  removeFromGridStateInStorage,
} from '../../utils';

describe('mergeGridStateIntoStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should set an item that is one-level deep in localStorage', () => {
    mergeGridStateIntoStorage('isLeftSidebarCollapsed', true);

    expect(localStorage.getItem('PAGE_LAYOUT_UI_STATE')).toStrictEqual(
      JSON.stringify({
        isLeftSidebarCollapsed: true,
      }),
    );
  });

  it('should update an item that is one-level deep in localStorage', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        isLeftSidebarCollapsed: false,
      }),
    );

    mergeGridStateIntoStorage('isLeftSidebarCollapsed', true);

    expect(localStorage.getItem('PAGE_LAYOUT_UI_STATE')).toStrictEqual(
      JSON.stringify({
        isLeftSidebarCollapsed: true,
      }),
    );
  });

  it('should not touch other parts of localStorage when setting an item that is one-level deep', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        otherPageLayoutKeys: 'Other page-layout values',
      }),
    );
    localStorage.setItem('someOtherKey', 'other value');

    mergeGridStateIntoStorage('isLeftSidebarCollapsed', true);

    expect(localStorage.getItem('someOtherKey')).toBe('other value');
    expect(localStorage.getItem('PAGE_LAYOUT_UI_STATE')).toBe(
      JSON.stringify({
        otherPageLayoutKeys: 'Other page-layout values',
        isLeftSidebarCollapsed: true,
      }),
    );
  });

  it('should set an nested item in localStorage', () => {
    expect(localStorage.getItem('PAGE_LAYOUT_UI_STATE')).toBe(null);

    mergeGridStateIntoStorage('gridState', {
      topNavigationHeight: 50,
      bannerHeight: 50,
    });

    expect(localStorage.getItem('PAGE_LAYOUT_UI_STATE')).toStrictEqual(
      JSON.stringify({
        gridState: {
          topNavigationHeight: 50,
          bannerHeight: 50,
        },
      }),
    );
  });

  it('should not touch other parts of localStorage when setting a nested item', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        otherPageLayoutKeys: 'Other page-layout values',
        gridState: {
          bannerHeight: 50,
        },
      }),
    );
    localStorage.setItem('someOtherKey', 'other value');

    mergeGridStateIntoStorage('gridState', {
      topNavigationHeight: 50,
    });

    expect(localStorage.getItem('someOtherKey')).toBe('other value');
    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({
      otherPageLayoutKeys: 'Other page-layout values',
      gridState: {
        topNavigationHeight: 50,
        bannerHeight: 50,
      },
    });
  });

  it('should update nested items ', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        otherPageLayoutKeys: 'Other page-layout values',
        gridState: {
          bannerHeight: 50,
          topNavigationHeight: 400,
        },
      }),
    );
    localStorage.setItem('someOtherKey', 'other value');

    mergeGridStateIntoStorage('gridState', {
      topNavigationHeight: 50,
    });

    expect(localStorage.getItem('someOtherKey')).toBe('other value');
    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({
      otherPageLayoutKeys: 'Other page-layout values',
      gridState: {
        topNavigationHeight: 50,
        bannerHeight: 50,
      },
    });
  });
});

describe('getGridStateFromStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should get one-level items', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        isLeftSidebarCollapsed: true,
      }),
    );

    expect(getGridStateFromStorage('isLeftSidebarCollapsed')).toStrictEqual(
      true,
    );
  });

  it('should get nested items ', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        isLeftSidebarCollapsed: true,
        gridState: {
          bannerHeight: 50,
          topNavigationHeight: 400,
        },
      }),
    );

    expect(getGridStateFromStorage('isLeftSidebarCollapsed')).toStrictEqual(
      true,
    );
    expect(getGridStateFromStorage('gridState')).toStrictEqual({
      bannerHeight: 50,
      topNavigationHeight: 400,
    });
    expect(getGridStateFromStorage('someRandomKey')).toStrictEqual(void 0);
  });
});

describe('removeFromGridStateInStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should one-level items', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        isLeftSidebarCollapsed: true,
      }),
    );

    removeFromGridStateInStorage('isLeftSidebarCollapsed');

    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({});
  });

  it('should remove second-level items', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        gridState: {
          bannerHeight: 50,
          topNavigationHeight: 400,
        },
      }),
    );

    removeFromGridStateInStorage('gridState', 'bannerHeight');

    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({
      gridState: {
        topNavigationHeight: 400,
      },
    });
  });

  it('should remove nested items', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        gridState: {
          bannerHeight: 50,
          topNavigationHeight: 400,
        },
      }),
    );

    removeFromGridStateInStorage('gridState');

    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({});
  });

  it('should leave rest of localStorage untouched', () => {
    localStorage.setItem(
      'PAGE_LAYOUT_UI_STATE',
      JSON.stringify({
        isLeftSidebarCollapsed: true,
        gridState: {
          bannerHeight: 50,
          topNavigationHeight: 400,
        },
      }),
    );
    localStorage.setItem('someOtherKey', 'other value');

    removeFromGridStateInStorage('isLeftSidebarCollapsed');

    expect(localStorage.getItem('someOtherKey')).toBe('other value');
    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({
      gridState: {
        bannerHeight: 50,
        topNavigationHeight: 400,
      },
    });

    removeFromGridStateInStorage('gridState', 'bannerHeight');

    expect(localStorage.getItem('someOtherKey')).toBe('other value');
    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({
      gridState: {
        topNavigationHeight: 400,
      },
    });

    removeFromGridStateInStorage('gridState');

    expect(localStorage.getItem('someOtherKey')).toBe('other value');
    expect(
      JSON.parse(localStorage.getItem('PAGE_LAYOUT_UI_STATE')!),
    ).toStrictEqual({});
  });
});
