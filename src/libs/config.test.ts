import { getDomains, getConfig } from './config';
import { mockParameters } from './__mocks__/aws-sdk';

describe('config.ts', () => {
  it('should return the domains', async () => {
    const result = await getDomains();
    expect(result).toEqual(mockParameters.domains);
  });

  it('should return the config for a domain', async () => {
    const result = await getConfig('hinterland.software');
    expect(result).toEqual(mockParameters['hinterland.software']);
  });

  it('should throw if config not found', async () => {
    try {
      await getConfig('xyz');
    } catch (error) {
      expect(error.message).toBe('ParameterNotFound');
    }
  });
});
