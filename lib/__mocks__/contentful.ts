const entry = ({ id, updatedAt, autoSynced }) => ({
  sys: { id, updatedAt },
  fields: { autoSynced },
});

export const mockEstates = {
  items: [
    entry({
      id: '1',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
    entry({
      id: '2',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
    entry({
      id: '3',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: false,
    }),
    entry({
      id: '4',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
  ],
};

export const mockCommon = mockEstates.items;

export const filteredResponse = [mockCommon[0], mockCommon[1], mockCommon[3]];

class Client {
  public async getEntries(): Promise<any> {
    return { ...mockEstates };
  }
}

export const createClient = () => new Client();
