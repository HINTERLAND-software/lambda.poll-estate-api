import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';

import { Logger, httpResponse } from './lib/utils';
import { getDomains } from './lib/config';
import { fetchEstateSets } from './lib/estates';
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
        Logger.log({ domain, payload });
        const webhooks = await triggerWebhooks(domain, payload);
        return { domain, webhooks };
      })
    );
    return httpResponse(
      200,
      `${results.length} domain${
        results.length === 0 ? 's' : ''
      } polled successfully`,
      results
    );
  } catch (error) {
    Logger.error(error);
    return httpResponse(error.statusCode, error.message, { error });
  }
};
