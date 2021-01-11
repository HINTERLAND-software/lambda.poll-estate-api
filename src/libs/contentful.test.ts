import { Contentful } from './contentful';
import { mockParameters } from './__mocks__/aws-sdk';
import { mockEstates, filteredResponse } from './__mocks__/contentful';

const config = mockParameters['hinterland.software'].contentful;

describe('contentful.ts', () => {
  test('initializes Contentful', () => {
    const result = new Contentful(config);
    expect(result).toBeInstanceOf(Contentful);
  });

  test('returns fetched estates', async () => {
    const cls = new Contentful(config);
    const result = await cls.fetchEstates();
    expect(result).toBeInstanceOf(Contentful);
    expect(result.estates).toEqual(mockEstates);
  });

  test('returns fetched and filtered estates', async () => {
    const result = new Contentful(config);
    expect((await result.fetchEstates()).filterEstates()).toEqual(
      filteredResponse
    );
  });
});
