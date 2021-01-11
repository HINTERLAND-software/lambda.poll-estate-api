import 'source-map-support/register';

import { Logger, getEnvironment } from '@libs/utils';
import { middyfy } from '@libs/lambda';
import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { clearCache, getConfig, getDomains } from '@libs/config';

export const config: ValidatedEventAPIGatewayProxyEvent<
  typeof Object
> = async () => {
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

export const main = middyfy(config);
