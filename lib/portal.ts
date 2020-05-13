import * as aggregators from 'estate-portal-aggregator';
import {
  BasicAuth,
  OAuth,
  TokenAuth,
} from 'estate-portal-aggregator/lib/classes/Authorization';
import { Aggregator } from 'estate-portal-aggregator/lib/classes/portals/Aggregator';
import {
  Estate,
  RealEstateCommonProperties,
} from 'estate-portal-aggregator/lib/classes/portals/Estate';
import jp from 'jsonpath';
import { PortalConfig } from '../types';

export class Portal {
  constructor(private config: PortalConfig) {}
  public estates: Estate[];

  private get aggregator(): Aggregator {
    const { type, version, credentials } = this.config;
    switch (type) {
      case 'flowfact':
        return version === 'v1'
          ? new aggregators.FlowFactV1(credentials as BasicAuth)
          : new aggregators.FlowFactV2(credentials as TokenAuth);
      case 'immobilienscout24':
        if (version === 'v1') {
          return new aggregators.Immobilienscout24(credentials as OAuth);
        }
      default:
        throw new Error(`Portal "${type}" (${version}) is not set up`);
    }
  }

  public async fetchEstates(): Promise<Portal> {
    this.estates = await this.aggregator.fetchEstates({
      detailed: false,
      recursively: true,
    });
    return this;
  }

  public filterEstates(): RealEstateCommonProperties[] {
    if (!this.estates) throw new Error('Fetch estates first');
    const { filter } = this.config;
    const commons = this.estates.map((estate) => estate.getCommon());
    if (!filter) return commons;
    return jp.query(commons, filter);
  }
}
