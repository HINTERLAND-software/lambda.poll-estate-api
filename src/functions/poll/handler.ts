import 'source-map-support/register';

import { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { clearCache, getDomains } from '@libs/config';
import { fetchEstateSets } from '@libs/estates';
import { middyfy } from '@libs/lambda';
import { generatePayload } from '@libs/triggers/utils';
import { triggerWebhooks } from '@libs/triggers/webhook';
import { getEnvironment, httpResponse, Logger } from '@libs/utils';

const pluralize = (results: Array<unknown>) =>
  results.length === 1 ? '' : 's';

export const poll: ValidatedEventAPIGatewayProxyEvent<typeof Object> =
  async () => {
    try {
      const domains = await getDomains();

      const results = await Promise.all(
        domains.map(async (domain) => {
          try {
            const estateSets = await fetchEstateSets(domain);
            const payload = generatePayload(estateSets);
            const webhooks = await triggerWebhooks(domain, payload);
            return {
              domain,
              webhooks,
              payload,
            };
          } catch (error) {
            return {
              domain,
              error: error.message || error,
            };
          }
        })
      );

      const env = getEnvironment();
      const successful = results.filter(({ error }) => !error);
      const unsuccessful = results.filter(({ error }) => error);
      const msg = `${successful.length} domain${pluralize(
        successful
      )} polled successfully, ${unsuccessful.length} domain${pluralize(
        unsuccessful
      )} failed (${env})`;

      clearCache();
      return httpResponse(200, msg, results);
    } catch (error) {
      Logger.error(error);
      clearCache();
      return httpResponse(error.statusCode, error.message, error);
    }
  };

export const main = middyfy(poll);
