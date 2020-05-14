import { poll } from './handler';

const responseBody = {
  message: '2 domain polled successfully (test)',
  result: [
    {
      domain: 'foobar.com',
      webhooks: [
        {
          url: 'https://foobar.com/webhook',
          triggered: false,
          hasUpdates: true,
          disabled: true,
          response: '',
        },
      ],
      payload: { created: ['6'], updated: [], deleted: ['2', '4'] },
    },
    {
      domain: 'hinterland.software',
      webhooks: [
        {
          url: 'https://hinterland.software/webhook',
          triggered: false,
          hasUpdates: true,
          disabled: true,
          response: '',
        },
        {
          url: 'https://hinterland.software/webhook',
          triggered: false,
          hasUpdates: true,
          disabled: true,
          response: '',
        },
      ],
      payload: { created: ['5'], updated: ['2'], deleted: ['1', '4'] },
    },
  ],
};

describe('handler.ts', () => {
  test('returns successfully', async () => {
    const result = await poll(undefined, undefined, undefined);
    expect(result).toEqual({
      body: JSON.stringify(responseBody),
      headers: {
        'Access-Control-Allow-Credentials': '*',
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 200,
    });
  });
});
