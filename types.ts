import {
  OAuth,
  BasicAuth,
  TokenAuth,
} from 'estate-portal-aggregator/lib/classes/Authorization';
import { RealEstateCommonProperties } from 'estate-portal-aggregator/lib/classes/portals/Estate';
import { Entry } from 'contentful';
import { OutgoingHttpHeaders } from 'http';

export interface WebhookResponse {
  url: string;
  triggered: boolean;
  hasUpdates: boolean;
  disabled: boolean;
  response?: any;
}

export interface Payload {
  deleted: string[];
  updated: string[];
  created: string[];
}

export interface EstateSets {
  portal: RealEstateCommonProperties[];
  contentful: Entry<any>[];
}

export type FlowFactVersion = 'v1' | 'v2';
export type Immobilienscout24Version = 'v1';
export type Types = 'immobilienscout24' | 'flowfact';

export declare interface PortalConfig {
  filter?: string;
  type: Types;
  version: FlowFactVersion | Immobilienscout24Version;
  credentials: OAuth | BasicAuth | TokenAuth;
}

export declare interface ContentfulConfig {
  filter?: string;
  estateContentTypeId: string;
  environmentId: string;
  spaceId: string;
  cdaToken: string;
}

export declare interface Webhook {
  url: string;
  headers?: OutgoingHttpHeaders;
  disabled?: boolean;
}

export declare interface Config {
  domain: string;
  webhooks: Array<Webhook>;
  portal: PortalConfig;
  contentful: ContentfulConfig;
}
