import { EstateSets } from '../types';
import { getConfig } from './config';
import { Contentful } from './contentful';
import { Portal } from './portal';

export const fetchEstateSets = async (domain: string): Promise<EstateSets> => {
  const {
    contentful: contentfulConfig,
    portal: portalConfig,
  } = await getConfig(domain);

  const portal = new Portal(portalConfig);
  const portalEstates = (await portal.fetchEstates()).filterEstates();
  const contentful = new Contentful(contentfulConfig);
  const contentfulEstates = (await contentful.fetchEstates()).filterEstates();

  return {
    portal: portalEstates,
    contentful: contentfulEstates,
  };
};
