import {
  getEpoch,
  isStaleEstate,
  generatePayload,
  triggerWebhooks,
} from './webhook';
import { mockCommonIS24 as portalMocks } from './__mocks__/estate-portal-aggregator';
import { mockCommon as contentfulMocks } from './__mocks__/contentful';
import * as https from 'https';
import * as http from 'http';
import { mockParameters } from './__mocks__/aws-sdk';
import { omit } from './utils';

jest.mock('https');
jest.mock('http');

const request = {
  write: jest.fn(),
  end: jest.fn(),
};

const mockedRequest = (url, options, cb) => {
  cb({
    on: jest.fn().mockImplementation((type, callback) => {
      if (type === 'end') return callback();
      if (type === 'data')
        return callback(Buffer.from(JSON.stringify({ url, options }), 'utf8'));
    }),
  });
  return request;
};

const mockedHttpRequest = http.request as jest.Mock<any>;
mockedHttpRequest.mockImplementation(mockedRequest);
const mockedHttpsRequest = https.request as jest.Mock<any>;
mockedHttpsRequest.mockImplementation(mockedRequest);

describe('webhooks.ts', () => {
  describe('getEpoch', () => {
    test('returns epoch time for ISO-8601 UTC string', () => {
      const result = getEpoch('2020-05-14T04:31:11Z');
      expect(result).toBe(1589430671000);
    });
  });

  describe('isStaleEstate', () => {
    test('returns true if data is stale', () => {
      const result = isStaleEstate(
        {
          sys: { updatedAt: '2020-05-14T04:31:11Z' },
        } as any,
        {
          updatedAt: 1589430671234,
        } as any
      );
      expect(result).toBe(true);
    });

    test('returns false if data is not stale', () => {
      const result = isStaleEstate(
        {
          sys: { updatedAt: '2020-05-14T04:31:11Z' },
        } as any,
        {
          updatedAt: 1589430671000,
        } as any
      );
      expect(result).toBe(false);
    });
  });

  describe('generatePayload', () => {
    test('returns the correct payload', () => {
      const estateSets = {
        portal: portalMocks,
        contentful: contentfulMocks,
      } as any;

      const result = generatePayload(estateSets);
      expect(result).toEqual({
        updates: {
          created: ['5'],
          deleted: ['1'],
          updated: ['2', '4'],
        },
      });
    });
  });

  describe('triggerWebhooks', () => {
    afterEach(() => {
      process.env.STAGE = 'production';
    });

    test('triggers the correct webhooks', async () => {
      process.env.STAGE = 'production';

      const domain = 'hinterland.software';

      const mocked = mockParameters[domain];

      const config = {
        domain: mocked.domain,
        portal: omit(mocked.portal, ['credentials', 'filter']),
        contentful: omit(mocked.contentful, ['cdaToken', 'filter']),
      };

      const payload = {
        updates: {
          created: ['5'],
          deleted: ['1'],
          updated: ['2', '4'],
        },
      };

      const result = await triggerWebhooks(domain, payload);

      expect(JSON.parse(request.write.mock.calls[0])).toEqual({
        ...payload,
        config,
      });
      expect(request.end).toHaveBeenCalledTimes(1);

      const response = {
        url: 'https://hinterland.software/webhook',
        options: {
          method: 'POST',
          port: '',
          headers: {
            'Content-Type': 'application/json',
            custom: 'hinterland.software',
          },
        },
      };

      expect(result).toEqual([
        {
          flags: {
            triggered: true,
            hasUpdates: true,
            disabled: false,
            environment: 'production',
          },
          response: JSON.stringify(response),
          url: 'https://hinterland.software/webhook',
        },
        {
          flags: {
            triggered: false,
            hasUpdates: true,
            disabled: true,
            environment: 'production',
          },
          url: 'https://hinterland.software/webhook',
        },
      ]);
    });
  });
});
