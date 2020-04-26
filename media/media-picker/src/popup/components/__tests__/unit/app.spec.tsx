import React from 'react';
import { shallow, mount } from 'enzyme';
import { createStore, applyMiddleware, Middleware } from 'redux';
import { Store } from 'react-redux';
import { fakeMediaClient } from '@atlaskit/media-test-helpers';
import {
  getComponentClassWithStore,
  mockStore,
} from '@atlaskit/media-test-helpers';
import { State } from '../../../domain';
import ConnectedApp, { App, AppDispatchProps } from '../../app';
import UploadView from '../../views/upload/upload';
import Browser from '../../views/browser/browser';
import { fileUploadsStart } from '../../../actions/fileUploadsStart';
import { LocalBrowserButton } from '../../views/upload/uploadButton';
import analyticsProcessing from '../../../middleware/analyticsProcessing';
import { Dropzone } from '../../../../components/dropzone/dropzone';
import { Browser as MediaPickerBrowser } from '../../../../components/browser/browser';
import { Clipboard as MediaPickerClipboard } from '../../../../components/clipboard/clipboard';
import { MediaFile, UploadParams } from '../../../../types';
import { AuthProvider } from '@atlaskit/media-core';
import { MediaClient } from '@atlaskit/media-client';
import NetworkErrorWarning from '../../views/warnings/networkError';

const tenantUploadParams: UploadParams = {};
const baseUrl = 'some-api-url';
const clientId = 'some-client-id';

const token = 'some-token';
const userAuthProvider: AuthProvider = () =>
  Promise.resolve({
    clientId,
    token,
    baseUrl,
  });

const makeFile = (id: string): MediaFile => ({
  id: `id${id}`,
  name: `name${id}`,
  size: 1,
  type: 'type',
  creationDate: 0,
});

describe('App', () => {
  const setup = () => {
    const mediaClient = fakeMediaClient({
      authProvider: userAuthProvider,
      userAuthProvider,
    });
    const userMediaClient = fakeMediaClient({
      authProvider: userAuthProvider,
    });
    return {
      handlers: {
        onStartApp: jest.fn(),
        onClose: jest.fn(),
        onUploadsStart: jest.fn(),
        onUploadPreviewUpdate: jest.fn(),
        onUploadEnd: jest.fn(),
        onUploadError: jest.fn(),
        onDropzoneDragOut: jest.fn(),
        onDropzoneDropIn: jest.fn(),
        onFileClick: jest.fn(),
      } as AppDispatchProps,
      mediaClient,
      userMediaClient,
      store: mockStore(),
      userAuthProvider,
    };
  };

  it('should render UploadView given selectedServiceName is "upload"', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();
    const app = shallow(
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="upload"
        isVisible={true}
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />,
    );

    expect(app.find(UploadView).length).toEqual(1);
  });

  it('should render Browser given selectedServiceName is "google"', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();
    const app = shallow(
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="google"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />,
    );

    expect(app.find(Browser).length).toEqual(1);
  });

  it('should render plugin content when the plugin is selected', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();
    const app = shallow(
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="plugin-1"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        plugins={[
          {
            name: 'plugin-1',
            icon: <p>plugin 1 icon</p>,
            render: () => <p>plugin 1 content</p>,
          },
        ]}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />,
    );

    expect(app.find('p').text()).toEqual('plugin 1 content');
  });

  it('should render Browser Error given selectedServiceName is "google" or "dropbox" and there\'s network error', () => {
    const {
      handlers,
      store: defaultStore,
      mediaClient,
      userMediaClient,
    } = setup();
    const store = mockStore({
      view: {
        ...defaultStore.getState().view,
        hasError: true,
      },
    });
    const appGoogle = mount(
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="google"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />,
    );

    const appDropbox = mount(
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="dropbox"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />,
    );

    expect(appGoogle.find(Browser).length).toEqual(1);
    expect(appGoogle.find(Browser).find(NetworkErrorWarning).length).toEqual(1);

    expect(appDropbox.find(Browser).length).toEqual(1);
    expect(appDropbox.find(Browser).find(NetworkErrorWarning).length).toEqual(
      1,
    );
  });

  it('should call onStartApp', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();
    shallow(
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="upload"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />,
    );

    expect(handlers.onStartApp).toHaveBeenCalledTimes(1);
  });

  describe('Dropzone', () => {
    it('should render <Dropzone />', () => {
      const { handlers, store, mediaClient, userMediaClient } = setup();

      const element = (
        <App
          store={store}
          selectedItems={[]}
          selectedServiceName="upload"
          tenantMediaClient={mediaClient}
          userMediaClient={userMediaClient}
          isVisible={true}
          tenantUploadParams={tenantUploadParams}
          {...handlers}
        />
      );

      const dropzoneMediaClient = new MediaClient({
        authProvider: mediaClient.config.authProvider,
        userAuthProvider: mediaClient.config.authProvider,
      });

      const wrapper = mount(element);
      const dropzone = wrapper.find(Dropzone);
      expect(JSON.stringify(dropzone.prop('mediaClient'))).toEqual(
        JSON.stringify(dropzoneMediaClient),
      );
      const dropzoneConfigProp = dropzone.prop('config');

      expect(dropzoneConfigProp).toHaveProperty(
        'uploadParams',
        tenantUploadParams,
      );
      expect(dropzoneConfigProp).toHaveProperty(
        'shouldCopyFileToRecents',
        false,
      );
    });

    it('should call dispatch props for onDragLeave and onDrop', async () => {
      const { handlers, store, mediaClient, userMediaClient } = setup();
      const element = (
        <App
          store={store}
          selectedItems={[]}
          selectedServiceName="upload"
          tenantMediaClient={mediaClient}
          userMediaClient={userMediaClient}
          isVisible={true}
          tenantUploadParams={tenantUploadParams}
          {...handlers}
        />
      );
      const wrapper = mount(element);
      const instance = wrapper.instance() as App;

      instance.onDragLeave({ length: 3 });
      expect(handlers.onDropzoneDragOut).toBeCalledWith(3);

      instance.onDrop({
        files: [makeFile('1'), makeFile('2'), makeFile('3')],
      });
      expect(handlers.onDropzoneDropIn).toBeCalledWith(3);
    });
  });

  it('should render <Browser />', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();

    const element = (
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="upload"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />
    );

    const wrapper = mount(element);
    expect(wrapper.find(MediaPickerBrowser)).toHaveLength(1);
  });

  it('should render <Clipboard />', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();

    const element = (
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="upload"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />
    );

    const wrapper = mount(element);
    expect(wrapper.find(MediaPickerClipboard)).toHaveLength(1);
  });

  it('should render media-editor view with localUploader', () => {
    const { handlers, store, mediaClient, userMediaClient } = setup();
    const element = (
      <App
        store={store}
        selectedItems={[]}
        selectedServiceName="upload"
        tenantMediaClient={mediaClient}
        userMediaClient={userMediaClient}
        isVisible={true}
        tenantUploadParams={tenantUploadParams}
        {...handlers}
      />
    );
    const wrapper = shallow(element);
    const instace: any = wrapper.instance();
    const editorView = wrapper.find('Connect(MainEditorView)');

    expect(editorView).toHaveLength(1);
    expect(editorView.prop('localUploader')).toEqual(instace.localUploader);
  });
});

describe('Connected App', () => {
  const setup = () => {
    const store = mockStore();
    const dispatch = store.dispatch;
    // TODO: Fix this
    const ConnectedAppWithStore = getComponentClassWithStore(
      ConnectedApp,
    ) as any;
    const component = shallow(
      <ConnectedAppWithStore
        store={store}
        tenantUploadParams={tenantUploadParams}
      />,
    ).find(App);
    return { dispatch, component };
  };

  it('should dispatch FILE_UPLOADS_START when onUploadsStart is called', () => {
    const { component, dispatch } = setup();
    const nowDate = Date.now();
    const payload = {
      files: [
        {
          id: 'some-id',
          name: 'some-name',
          size: 42,
          creationDate: nowDate,
          type: 'image/jpg',
        },
      ],
    };
    component.props().onUploadsStart(payload);

    expect(dispatch).toHaveBeenCalledWith(
      fileUploadsStart({
        files: [
          {
            id: 'some-id',
            name: 'some-name',
            size: 42,
            creationDate: nowDate,
            type: 'image/jpg',
          },
        ],
      }),
    );
  });

  it('should fire an analytics events when provided with a react mediaClient via a store', () => {
    const handler = jest.fn();
    const store: Store<State> = createStore<State>(
      state => state,
      mockStore({
        view: {
          isVisible: true,
          items: [],
          isLoading: false,
          hasError: false,
          path: [],
          service: {
            accountId: 'some-view-service-account-id',
            name: 'upload',
          },
          isUploading: false,
          isCancelling: false,
        },
        config: {
          proxyReactContext: {
            getAtlaskitAnalyticsEventHandlers: () => [handler],
          },
        },
      }).getState(),
      applyMiddleware(analyticsProcessing as Middleware),
    );

    // TODO: fix this
    const ConnectedAppWithStore = getComponentClassWithStore(
      ConnectedApp,
    ) as any;
    const component = mount(
      <ConnectedAppWithStore store={store} tenantUploadParams={{}} />,
    );
    component.find(LocalBrowserButton).simulate('click');
    expect(handler).toBeCalledWith(
      expect.objectContaining({
        payload: {
          attributes: {
            componentName: 'mediaPicker',
            componentVersion: expect.any(String),
            packageName: '@atlaskit/media-picker',
          },
          eventType: 'screen',
          name: 'localFileBrowserModal',
        },
      }),
      'media',
    );
  });
});
