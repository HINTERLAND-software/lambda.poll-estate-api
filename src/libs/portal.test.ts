import { Portal } from './portal';
import { mockParameters } from './__mocks__/aws-sdk';
import {
  mockEstatesIS24,
  mockEstatesFFV2,
  filteredResponseIS24,
} from './__mocks__/estate-portal-aggregator';

const configIS24 = mockParameters['hinterland.software'].portal as any;
const configFFV2 = mockParameters['foobar.com'].portal as any;

describe('portal.ts', () => {
  test('initializes Immobilienscout24 v1', () => {
    const result = new Portal(configIS24);
    expect(result).toBeInstanceOf(Portal);
  });

  test('initializes FlowFact v2', async () => {
    const cls = new Portal(configFFV2);
    const result = await cls.fetchEstates();
    expect(result).toBeInstanceOf(Portal);
    expect(result.estates).toEqual(mockEstatesFFV2);
    expect(result).toBeInstanceOf(Portal);
  });

  test('returns fetched estates', async () => {
    const cls = new Portal(configIS24);
    const result = await cls.fetchEstates();
    expect(result).toBeInstanceOf(Portal);
    expect(result.estates).toEqual(mockEstatesIS24);
  });

  test('returns fetched and filtered estates', async () => {
    const result = new Portal(configIS24);
    expect((await result.fetchEstates()).filterEstates()).toEqual(
      filteredResponseIS24
    );
  });
});
