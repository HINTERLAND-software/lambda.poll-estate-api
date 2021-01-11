import * as contentful from 'contentful';
import jp from 'jsonpath';
import { ContentfulConfig } from './types';

export class Contentful {
  constructor(private config: ContentfulConfig) {}
  public estates: contentful.EntryCollection<any>;

  private get client(): contentful.ContentfulClientApi {
    const {
      spaceId: space,
      cdaToken: accessToken,
      environmentId: environment,
    } = this.config;
    return contentful.createClient({ space, accessToken, environment });
  }

  public async fetchEstates(): Promise<Contentful> {
    this.estates = await this.client.getEntries({
      content_type: this.config.estateContentTypeId,
      include: 1,
    });
    return this;
  }

  public filterEstates(): contentful.Entry<any>[] {
    if (!this.estates) throw new Error('Fetch estates first');
    const { filter } = this.config;
    const { items } = this.estates;
    if (!filter) return items;
    return jp.query(items, filter);
  }
}
