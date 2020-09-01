import { ComponentType } from 'react';

import { ADFEntity } from '@atlaskit/adf-utils';

import { ExtensionParams, UpdateExtension } from './extension-handler';
import { Parameters } from './extension-parameters';
import { FieldDefinition } from './field-definitions';

export type ESModule<T> = {
  __esModule?: boolean;
  default: T;
};

export type MaybeESModule<T> = ESModule<T> | T;

export type ExtensionType = string;
export type ExtensionKey = string;
export type ExtensionModuleKey = string;
export type ExtensionIcon = ComponentType<any>;
export type ExtensionIconModule = Promise<MaybeESModule<ExtensionIcon>>;
export type ExtensionComponentProps<T extends Parameters = Parameters> = {
  node: ExtensionParams<T>;
  [key: string]: any; // many renderers pass their own context through too
};

export type ExtensionComponent<T extends Parameters> = ComponentType<
  ExtensionComponentProps<any>
>;
export type ExtensionComponentModule<T extends Parameters> = Promise<
  MaybeESModule<ExtensionComponent<T>>
>;

export type Option = {
  label: string;
  value: string;
  description?: string;
  icon?: string | React.ReactNode;
};

export type Serializer<T extends Parameters = Parameters> = (data: T) => string;
export type Deserializer<T extends Parameters = Parameters> = (
  value: string,
) => T;

export type ExtensionModuleActionObject<T extends Parameters = Parameters> = {
  key: ExtensionModuleKey;
  type: 'node';
  parameters?: T;
};

export type MaybeADFEntity = MaybeESModule<ADFEntity | void>;
export type ExtensionModuleActionHandler = () => Promise<MaybeADFEntity>;

export type ExtensionModuleAction<T extends Parameters = Parameters> =
  | ExtensionModuleActionObject<T>
  | ExtensionModuleActionHandler;

export type ExtensionModule<T extends Parameters = Parameters> = {
  key: string;
  title?: string;
  description?: string;
  icon?: () => ExtensionIconModule;
  priority?: number;
  featured?: boolean;
  keywords?: string[];
  categories?: string[];
  action: ExtensionModuleAction<T>;
  parameters?: T;
};

export type ExtensionModuleNode<T extends Parameters = Parameters> = {
  type: 'extension' | 'inlineExtension' | 'bodiedExtension';
  render: () => ExtensionComponentModule<T>;
  update?: UpdateExtension<T>;
  getFieldsDefinition?: (extensionParameters: T) => Promise<FieldDefinition[]>;
};

export type ExtensionModuleNodes<T extends Parameters = Parameters> = {
  [key: string]: ExtensionModuleNode<T>;
};

export type ExtensionAutoConvertHandler = (
  text: string,
) => ADFEntity | undefined;

export type ExtensionModuleAutoConvert = {
  url?: ExtensionAutoConvertHandler[];
};

export type CustomFieldResolver = (
  searchTerm?: string,
  defaultValue?: string | string[],
) => Promise<Option[]>;

export type ExtensionModuleFieldTypeCustom = { resolver?: CustomFieldResolver };

export type ExtensionModuleFieldTypeFieldset<
  T extends Parameters = Parameters
> = {
  serializer?: Serializer<T>;
  deserializer?: Deserializer<T>;
};

export type ExtensionModuleFields<T extends Parameters = Parameters> = {
  custom?: {
    [key: string]: ExtensionModuleFieldTypeCustom;
  };
  fieldset?: {
    [key: string]: ExtensionModuleFieldTypeFieldset<T>;
  };
};

export type ExtensionModules<T extends Parameters = Parameters> = {
  // define items to show up in the slash menu, element browser and plus menu
  quickInsert?: ExtensionModule<T>[];
  // define how to handle each type of node (update, render, config, etc)
  nodes?: ExtensionModuleNodes<T>;
  // define how to handle special fields used in config forms
  fields?: ExtensionModuleFields<T>;
  // define how/when to convert pasted content to this extension
  autoConvert?: ExtensionModuleAutoConvert;
};

export type ExtensionQuickInsertModule = 'quickInsert';
export type ExtensionModuleType<T extends Parameters = Parameters> = Exclude<
  keyof ExtensionModules<T>,
  'nodes' | 'fields'
>;

export type ExtensionManifest<T extends Parameters = Parameters> = {
  type: ExtensionType;
  key: ExtensionKey;
  title: string;
  description: string;
  categories?: string[];
  keywords?: string[];
  icons: {
    '48': () => ExtensionIconModule;
    [dimensions: string]: () => ExtensionIconModule;
  };
  modules: ExtensionModules<T>;
};

// deprecated types
export type Icon = () => ExtensionIconModule;
export type Module<T extends Parameters> = MaybeESModule<T>;
