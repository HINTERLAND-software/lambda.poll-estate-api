import { Entry } from 'contentful';
import { RealEstateCommonProperties } from 'estate-portal-aggregator/lib/classes/portals/Estate';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { EstateSets, Payload, Webhook, WebhookResponse } from '../types';
import { getConfig } from './config';

const getEpoch = (date: string): number => new Date(date).getTime();

const isStaleEstate = (
  contentfulEstate: Entry<any>,
  portalEstate: RealEstateCommonProperties
): boolean => {
  return portalEstate.updatedAt > getEpoch(contentfulEstate.sys.updatedAt);
};

export const generatePayload = (sets: EstateSets): Payload => {
  const { contentful, portal } = sets;

  const reduced = portal.reduce(
    (acc, estate) => {
      const foundEstate = contentful.find(
        ({ sys }) => sys.id === estate.internalID
      );

      if (!foundEstate) {
        return { ...acc, created: [...acc.created, estate] };
      }
      if (isStaleEstate(foundEstate, estate)) {
        return { ...acc, updated: [...acc.updated, estate] };
      }
      return acc;
    },
    { created: [], updated: [] }
  );

  const deleted = contentful
    .filter(({ sys }) => portal.some(({ internalID }) => internalID !== sys.id))
    .map(({ sys }) => sys.id);

  return { ...reduced, deleted };
};

const triggerWebhook = (
  webhook: Webhook,
  payload: Payload
): Promise<string> => {
  const { url, headers } = webhook;

  const { port, protocol } = new URL(url);

  const options: https.RequestOptions | http.RequestOptions = {
    method: 'POST',
    port,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const { request } = protocol === 'https' ? https : http;

  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString()));
      res.on('error', reject);
    });
    req.write(JSON.stringify(payload));
    req.end();
  });
};

export const triggerWebhooks = async (
  domain: string,
  payload: Payload
): Promise<WebhookResponse[]> => {
  const { webhooks, enabled } = await getConfig(domain);
  const hasUpdates = Object.values(payload).some((val) => val.length > 0);

  if (hasUpdates && enabled && webhooks.length > 0) {
    return Promise.all(
      webhooks.map(async (webhook) => {
        const result = await triggerWebhook(webhook, payload);
        return { url: webhook.url, hasUpdates, enabled, result };
      })
    );
  }

  return webhooks.map(({ url }) => ({
    url,
    hasUpdates,
    enabled,
    result: undefined,
  }));
};
