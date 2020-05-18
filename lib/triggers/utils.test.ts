import { generatePayload, getEpoch, isStaleEstate } from './utils';
import { mockCommonIS24 as portalMocks } from '../__mocks__/estate-portal-aggregator';
import { mockCommon as contentfulMocks } from '../__mocks__/contentful';

describe('utils.ts', () => {
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
});
