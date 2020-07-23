import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { getDomains, clearCache, getConfig } from './lib/config';
import { fetchEstateSets } from './lib/estates';
import { getEnvironment, httpResponse, Logger } from './lib/utils';
import { triggerWebhooks } from './lib/triggers/webhook';
import { generatePayload } from './lib/triggers/utils';

const pluralize = (results) => (results.length === 1 ? '' : 's');

export const poll: APIGatewayProxyHandler = async (): Promise<
  APIGatewayProxyResult
> => {
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
            error,
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

export const config: APIGatewayProxyHandler = async (): Promise<
  APIGatewayProxyResult
> => {
  try {
    const domains = await getDomains();
    const configurations = await Promise.all(domains.map(getConfig));
    const env = getEnvironment();

    clearCache();
    return httpResponse(200, 'Configuration results', {
      env,
      domains,
      configurations,
    });
  } catch (error) {
    Logger.error(error);
    clearCache();
    return httpResponse(error.statusCode, error.message, error);
  }
};
