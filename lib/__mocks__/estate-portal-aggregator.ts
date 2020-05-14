class MockEstate {
  constructor(private values) {}
  getCommon() {
    return this.values;
  }
}

export const mockEstatesIS24 = [
  new MockEstate({
    internalID: '5',
    updatedAt: 123456789,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
  new MockEstate({
    internalID: '2',
    updatedAt: 1589430671234,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
  new MockEstate({
    internalID: '3',
    updatedAt: 1589430671000,
    archived: false,
    active: true,
    marketingType: 'PURCHASE',
  }),
  new MockEstate({
    internalID: '4',
    updatedAt: 1589430671239,
    archived: true,
    active: true,
    marketingType: 'RENT',
  }),
];

export const mockCommonIS24 = mockEstatesIS24.map((estate) =>
  estate.getCommon()
);

export const filteredResponseIS24 = [mockCommonIS24[0], mockCommonIS24[1]];

export const mockEstatesFFV2 = [
  new MockEstate({
    internalID: '1',
    updatedAt: 123456789,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
  new MockEstate({
    internalID: '6',
    updatedAt: 1589430671234,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
];

export const mockCommonFFV2 = mockEstatesFFV2.map((estate) =>
  estate.getCommon()
);

export const filteredResponseFFV2 = [mockCommonFFV2[0], mockCommonFFV2[1]];

export class Immobilienscout24 {
  public async fetchEstates(): Promise<any> {
    return [...mockEstatesIS24];
  }
}

export class FlowFactV2 {
  public async fetchEstates(): Promise<any> {
    return [...mockEstatesFFV2];
  }
}
export class FlowFactV1 extends Immobilienscout24 {}
