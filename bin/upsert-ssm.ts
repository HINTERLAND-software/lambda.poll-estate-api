import { SSM } from 'aws-sdk';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '../lib/utils';
import { Config } from '../types';

config();

const { AWS_REGION, ENV } = process.env;

const ssm = new SSM({ region: AWS_REGION });

const { name } = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8')
);
const PREFIX = `/${name}/${ENV}`;

const upsertParameter = async (
  name: string,
  value: string,
  overrides: any = {}
): Promise<any> => {
  const params: SSM.PutParameterRequest = {
    Type: 'SecureString',
    Overwrite: true,
    Name: name,
    Value: value,
    Tier: 'Standard',
    ...overrides,
  };
  return {
    Name: name,
    Type: params.Type,
    ...(await ssm.putParameter(params).promise()),
  };
};

const upsertDomain = async (config: Config): Promise<any> => {
  return upsertParameter(
    `${PREFIX}/config/${config.domain}`,
    JSON.stringify(config)
  );
};

const upsertDomains = async (domains: Array<string>): Promise<any> => {
  return upsertParameter(`${PREFIX}/domains`, JSON.stringify(domains), {
    Type: 'String',
  });
};

const upsert = async () => {
  const configString = readFileSync(
    resolve(__dirname, '../.env.json'),
    'utf-8'
  );
  const configs = JSON.parse(configString) as Array<Config>;

  const domains = configs.map(({ domain }) => domain);

  return {
    domains: await upsertDomains(domains),
    configs: await Promise.all(configs.map(upsertDomain)),
  };
};

upsert().then(Logger.log).catch(Logger.error);
