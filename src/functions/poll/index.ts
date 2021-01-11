import type { AWS } from '@serverless/typescript';

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  timeout: 30,
  events: [
    {
      http: {
        private: true,
        cors: true,
        path: '/',
        method: 'post',
      },
    },
    {
      schedule: {
        rate: 'cron(0 6-21 * * ? *)',
        enabled: '${self:custom.enabled.${self:provider.stage}}',
      },
    },
  ],
} as AWS['functions'];
