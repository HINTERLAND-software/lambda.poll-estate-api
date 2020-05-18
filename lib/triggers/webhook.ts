import http from 'http';
import https from 'https';
import { URL } from 'url';
import { Payload, Webhook, WebhookResponse } from '../../types';
import { getConfig } from '../config';
import { getConfigPayload, getFlags } from './utils';

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

  const { request } = protocol === 'https:' ? https : http;

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
  const { webhooks } = await getConfig(domain);
  const { hasUpdates, config } = await getConfigPayload(domain, payload);

  return Promise.all(
    webhooks.map(async (webhook) => {
      const res: WebhookResponse = {
        url: webhook.url,
        flags: getFlags(webhook, hasUpdates),
      };

      if (res.flags.triggered) {
        res.response = await triggerWebhook(webhook, { ...payload, config });
      }

      return res;
    })
  );
};
