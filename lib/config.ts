import { SSM } from 'aws-sdk';
import { Config } from '../types';

export const fetchSSM = async (path: string): Promise<string | undefined> => {
  const { AWS_REGION: region, AWS_SSM_PREFIX: prefix } = process.env;
  const ssm = new SSM({ region });
  const result = await ssm
    .getParameter({ Name: `${prefix}${path}`, WithDecryption: true })
    .promise();
  return result.Parameter.Value;
};

export const fetchConfig = (domain: string): Promise<string> => {
  return fetchSSM(`/config/${domain}`);
};

export const parseConfig = (config: string): Config => {
  let parsed: Config;
  try {
    parsed = JSON.parse(config) as Config;
  } catch (error) {
    throw new Error('Misshaped domain config');
  }
  return parsed;
};

const cache: { [key: string]: Config } = {};

export const getConfig = async (domain: string): Promise<Config> => {
  if (cache[domain]) return cache[domain];

  const configString = await fetchConfig(domain);
  const config = parseConfig(configString);

  if (!config.domain) {
    throw new Error(`No configuration found for domain "${domain}"`);
  }

  cache[domain] = config;
  return config;
};

export const fetchDomains = (): Promise<string> => {
  return fetchSSM(`/domains`);
};

export const parseDomains = (domains: string): string[] => {
  let parsed: string[];
  try {
    parsed = JSON.parse(domains) as string[];
  } catch (error) {
    throw new Error('Misshaped domains');
  }
  return parsed;
};

export const getDomains = async (): Promise<string[]> => {
  const domainsString = await fetchDomains();
  const domains = parseDomains(domainsString);
  return domains;
};
