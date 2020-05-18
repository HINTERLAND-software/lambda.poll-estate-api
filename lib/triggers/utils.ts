import {
  EstateSets,
  Payload,
  InvokeCommon,
  InvokeResponseCommon,
} from '../../types';
import { RealEstateCommonProperties } from 'estate-portal-aggregator/lib/classes/portals/Estate';
import { Entry } from 'contentful';
import { getEnvironment, omit } from '../utils';
import { getConfig } from '../config';

export const getEpoch = (date: string): number => new Date(date).getTime();

export const isStaleEstate = (
  contentfulEstate: Entry<any>,
  portalEstate: RealEstateCommonProperties
): boolean => {
  return portalEstate.updatedAt > getEpoch(contentfulEstate.sys.updatedAt);
};

export const generatePayload = (sets: EstateSets): Payload => {
  const { contentful, portal } = sets;
  const changed = portal.reduce(
    (acc, estate) => {
      const foundEstate = contentful.find(
        ({ sys }) => sys.id === estate.internalID
      );
      if (!foundEstate) {
        return { ...acc, created: [...acc.created, estate.internalID] };
      }
      if (isStaleEstate(foundEstate, estate)) {
        return { ...acc, updated: [...acc.updated, estate.internalID] };
      }
      return acc;
    },
    { created: [], updated: [] }
  );

  const deleted = contentful
    .filter(({ sys }) =>
      portal.every(({ internalID }) => internalID !== sys.id)
    )
    .map(({ sys }) => sys.id);

  return {
    updates: {
      ...changed,
      deleted,
    },
  };
};

export const getConfigPayload = async (domain: string, payload: Payload) => {
  const { contentful, portal } = await getConfig(domain);

  const hasUpdates = Object.values(payload.updates).some(
    (val) => val.length > 0
  );
  const environment = getEnvironment();
  const isProduction = environment === 'production';

  const config = {
    domain,
    contentful: omit(contentful, ['cdaToken', 'filter']),
    portal: omit(portal, ['credentials', 'filter']),
  };

  return { config, hasUpdates, isProduction };
};

export const getFlags = (
  item: InvokeCommon,
  hasUpdates: boolean
): InvokeResponseCommon['flags'] => {
  const environment = getEnvironment();
  const isProduction = environment === 'production';

  return {
    triggered: hasUpdates && isProduction && !item.disabled,
    environment,
    disabled: !!item.disabled,
    hasUpdates,
  };
};
