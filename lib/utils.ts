import { APIGatewayProxyResult } from 'aws-lambda';

export const httpResponse = (
  statusCode: number = 400,
  message: string,
  result?: any
): APIGatewayProxyResult => {
  Logger.log(JSON.stringify({ statusCode, message, result }, null, 2));
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*',
    },
    body: JSON.stringify({
      message,
      result,
    }),
  };
};

export class Logger {
  static log(message?: any, ...optionalParams: any[]) {
    process.env.NODE_ENV !== 'test' && console.log(message, ...optionalParams);
  }
  static info(message?: any, ...optionalParams: any[]) {
    process.env.NODE_ENV !== 'test' && console.info(message, ...optionalParams);
  }
  static warn(message?: any, ...optionalParams: any[]) {
    process.env.NODE_ENV !== 'test' && console.warn(message, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }
}

export const getEnvironment = (): string => {
  const { STAGE, NODE_ENV = 'development' } = process.env;
  return STAGE || NODE_ENV;
};
