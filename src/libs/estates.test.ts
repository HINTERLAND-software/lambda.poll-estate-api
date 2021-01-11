import { fetchEstateSets } from './estates';
import { filteredResponse as contentful } from './__mocks__/contentful';
import {
  filteredResponseIS24 as portal,
  filteredResponseFFV2 as portalFF,
} from './__mocks__/estate-portal-aggregator';

describe('estates.ts', () => {
  test('returns estate sets for 1st domain', async () => {
    const result = await fetchEstateSets('hinterland.software');
    expect(result).toEqual({ portal, contentful });
  });

  test('returns estate sets for 2nd domain', async () => {
    const result = await fetchEstateSets('foobar.com');
    expect(result).toEqual({ portal: portalFF, contentful });
  });
});
