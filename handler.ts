import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { getDomains } from './lib/config';
import { fetchEstateSets } from './lib/estates';
import { getEnvironment, httpResponse, Logger } from './lib/utils';
import { generatePayload, triggerWebhooks } from './lib/webhook';

export const poll: APIGatewayProxyHandler = async (): Promise<
  APIGatewayProxyResult
> => {
  try {
    const domains = await getDomains();

    const results = await Promise.all(
      domains.map(async (domain) => {
        const estateSets = await fetchEstateSets(domain);
        const payload = generatePayload(estateSets);
        const webhooks = await triggerWebhooks(domain, payload);
        return { domain, webhooks, payload };
      })
    );

    const env = getEnvironment();
    const plural = results.length === 0 ? 's' : '';
    const msg = `${results.length} domain${plural} polled successfully (${env})`;

    return httpResponse(200, msg, results);
  } catch (error) {
    Logger.error(error);
    return httpResponse(error.statusCode, error.message, error);
  }
};
