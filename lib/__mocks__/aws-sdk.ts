export const mockParameters = {
  'hinterland.software': {
    domain: 'hinterland.software',
    webhooks: [
      {
        url: 'https://hinterland.software/webhook',
        disabled: false,
        headers: {
          custom: 'hinterland.software',
        },
      },
      {
        url: 'https://hinterland.software/webhook',
        disabled: true,
      },
    ],
    portal: {
      type: 'immobilienscout24',
      version: 'v1',
      filter:
        "$[?(@.archived == false && @.active == true && @.marketingType == 'RENT')]",
      credentials: {
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      },
    },
    contentful: {
      filter: '$[?(@.fields.autoSynced == true)]',
      estateContentTypeId: 'estate',
      environmentId: 'master',
      spaceId: 'spaceId',
      cdaToken: 'cdaToken',
    },
  },
  'foobar.com': {
    domain: 'foobar.com',
    webhooks: [
      {
        url: 'https://foobar.com/webhook',
        headers: {
          custom: 'foobar.com',
        },
      },
    ],
    portal: {
      type: 'flowfact',
      version: 'v2',
      filter:
        "$[?(@.archived == false && @.active == true && @.marketingType == 'RENT')]",
      credentials: {
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      },
    },
    contentful: {
      filter: '$[?(@.fields.autoSynced == true)]',
      estateContentTypeId: 'estate',
      environmentId: 'master',
      spaceId: 'spaceId',
      cdaToken: 'cdaToken',
    },
  },
  domains: ['foobar.com', 'hinterland.software'],
};

export class SSM {
  getParameter({ Name }) {
    const result = mockParameters[Name.split('/').pop()];
    if (!result) throw new Error('ParameterNotFound');
    return {
      promise: jest
        .fn()
        .mockResolvedValue({ Parameter: { Value: JSON.stringify(result) } }),
    };
  }
}
