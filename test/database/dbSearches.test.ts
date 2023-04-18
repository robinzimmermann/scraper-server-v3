import { jest } from '@jest/globals';
import 'jest-extended';
// import os from 'os';
import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { Searches } from '../../src/database/models/dbSearches';

import * as dbSearches from '../../src/database/dbSearches';
import {
  CraigslistRegion,
  CraigslistSearchDetails,
  CraigslistSubcategory,
  FacebookRegion,
  FacebookSearchDetails,
  Source,
} from '../../src/database/models/dbSearches';
import { logger } from '../../src/utils/logger/logger';
import * as dbSearchesTestData from './testData/dbSearchesTestData';
import { SpiedFunction } from 'jest-mock';
// import { JsonDb } from '../../src/api/jsonDb/JsonDb';

jest.mock('../../src/api/jsonDb/lowdbDriver');

let searchesDb = JsonDb<Searches>();
let writeSpy: SpiedFunction<() => void>;

const initializeJest = (): void => {
  jest.clearAllMocks();
  searchesDb = JsonDb<Searches>();
  writeSpy = jest.spyOn(searchesDb, 'write');
};

describe('dbSearches initialization', () => {
  beforeEach(() => {
    initializeJest();
  });

  // const doNegativeTest = (element: unknown, phraseInError: string): void => {
  const doNegativeTest = (element: unknown, phraseInError: string): void => {
    // const jsonDb = JsonDb<Searches>();
    searchesDb.setCacheDir(JSON.stringify(element));
    const result = dbSearches.init(searchesDb);
    const negErrors: string[] = [];
    expect(result.isOk()).toBeFalse();
    expect(result.isErr()).toBeTrue();
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => negErrors.push(msg)),
    );
    negErrors.forEach((error) => logger.info(error));
    expect(negErrors).toHaveLength(1);
    expect(negErrors[0]).toContain(phraseInError);
  };

  test('initializes when no database file is present', () => {
    searchesDb.setCacheDir('');
    dbSearches.init(searchesDb);

    expect(dbSearches.getValidEnabledSearches()).toBeEmpty();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('valid search works', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.valid));
    const result = dbSearches.init(searchesDb);

    // const result = dbSearches.init(JSON.stringify(dbSearchesTestData.valid));
    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    let search = dbSearches.getSearchBySid('5');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search.sid).toBe('5');
    expect(search.isEnabled).toBeBoolean();
    expect(typeof search.rank).toBe('number');
    expect(search.sources).toIncludeSameMembers([Source.craigslist]);
    let searchDetails:
      | CraigslistSearchDetails
      | FacebookSearchDetails
      | undefined = search.craigslistSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys([
      'searchTerms',
      'regions',
      'subcategories',
    ]);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regions).toBeArrayOfSize(2);
    expect(searchDetails?.regions).toIncludeSameMembers([
      CraigslistRegion.sfBayArea,
      CraigslistRegion.inlandEmpire,
    ]);
    expect(searchDetails?.subcategories).toIncludeSameMembers([
      CraigslistSubcategory.motorcycles,
      CraigslistSubcategory.tools,
    ]);
    searchDetails = search.facebookSearchDetails;
    expect(searchDetails).toBeFalsy();

    search = dbSearches.getSearchBySid('6');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search.sources).toIncludeSameMembers([Source.facebook]);
    searchDetails = search.craigslistSearchDetails;
    expect(searchDetails).toBeFalsy();
    searchDetails = search.facebookSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys(['searchTerms', 'regionalDetails']);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regionalDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ region: FacebookRegion.reno }),
        expect.objectContaining({ region: FacebookRegion.telluride }),
      ]),
    );

    search = dbSearches.getSearchBySid('7');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search.sources).toIncludeSameMembers([
      Source.craigslist,
      Source.facebook,
    ]);
    searchDetails = search.craigslistSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys([
      'searchTerms',
      'regions',
      'subcategories',
    ]);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regions).toIncludeSameMembers([
      CraigslistRegion.sfBayArea,
      CraigslistRegion.inlandEmpire,
    ]);
    expect(searchDetails?.subcategories).toIncludeSameMembers([
      CraigslistSubcategory.motorcycles,
      CraigslistSubcategory.tools,
    ]);
    searchDetails = search.facebookSearchDetails;
    expect(searchDetails).toBeObject();
    expect(searchDetails).toContainAllKeys(['searchTerms', 'regionalDetails']);
    expect(searchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(searchDetails?.regionalDetails).toBeArrayOfSize(2);
    expect(searchDetails?.regionalDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ region: FacebookRegion.reno }),
        expect.objectContaining({ region: FacebookRegion.telluride }),
      ]),
    );
  });

  test('sid missing fails', () => {
    doNegativeTest(dbSearchesTestData.sidMissing, 'has no element');
  });

  test('sid wrong type fails', () => {
    doNegativeTest(dbSearchesTestData.sidWrongType, 'not of type');
  });

  test('sid has no value fails', () => {
    doNegativeTest(dbSearchesTestData.sidHasNoValue, 'no value');
  });

  test('alias missing fails', () => {
    doNegativeTest(dbSearchesTestData.aliasMissing, 'has no element');
  });

  test('alias wrong type fails', () => {
    doNegativeTest(dbSearchesTestData.aliasWrongType, 'not of type');
  });

  test('alias has no value fails', () => {
    doNegativeTest(dbSearchesTestData.aliasHasNoValue, 'no value');
  });

  test('alias missing fails', () => {
    doNegativeTest(dbSearchesTestData.aliasMissing, 'has no element');
  });

  test('alias wrong type fails', () => {
    doNegativeTest(dbSearchesTestData.aliasWrongType, 'not of type');
  });

  test('alias has no value fails', () => {
    doNegativeTest(dbSearchesTestData.aliasHasNoValue, 'no value');
  });

  test('isEnabled missing fails', () => {
    doNegativeTest(dbSearchesTestData.isEnabledMissing, 'has no element');
  });

  test('isEnabled wrong type fails', () => {
    doNegativeTest(dbSearchesTestData.isEnabledWrongType, 'not of type');
  });

  test('valid minPrice works', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        minPrice: 134,
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbSearches.init(searchesDb);

    if (result.isErr()) {
      result.mapErr((messages: string[]) =>
        messages.forEach((msg) => logger.error(`${msg}`)),
      );
    }

    expect(result.isOk()).toBeTrue();

    const search = dbSearches.getSearchBySid('5');
    // This if is here for Typescript
    if (search) {
      expect(search.minPrice).toBe(134);
    } else {
      expect(search).toBeDefined();
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('minPrice is wrong type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        minPrice: '234',
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };
    doNegativeTest(initialFile, 'not of type');
  });

  test('valid maxPrice works', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        maxPrice: 234,
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbSearches.init(searchesDb);

    if (result.isErr()) {
      result.mapErr((messages: string[]) =>
        messages.forEach((msg) => logger.error(`${msg}`)),
      );
    }

    expect(result.isOk()).toBeTrue();

    const search = dbSearches.getSearchBySid('5');
    // This if is here for Typescript
    if (search) {
      expect(search.maxPrice).toBe(234);
    } else {
      expect(search).toBeDefined();
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('maxPrice is wrong type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        maxPrice: '234',
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };
    doNegativeTest(initialFile, 'not of type');
  });

  test('valid minPrice and maxPrice works', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        minPrice: 134,
        maxPrice: 234,
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbSearches.init(searchesDb);

    if (result.isErr()) {
      result.mapErr((messages: string[]) =>
        messages.forEach((msg) => logger.error(`${msg}`)),
      );
    }

    expect(result.isOk()).toBeTrue();

    const search = dbSearches.getSearchBySid('5');
    // This if is here for Typescript
    if (search) {
      expect(search.minPrice).toBe(134);
      expect(search.maxPrice).toBe(234);
    } else {
      expect(search).toBeDefined();
    }

    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('missing sources fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        // sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'has no value');
  });

  test('sources with wrong type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: 123,
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'which is not');
  });

  test('empty sources fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: [],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'no values');
  });

  test('invalid source fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist', 'poop'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'not valid');
  });

  test('craigslist search with no details fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
      },
    };

    doNegativeTest(initialFile, 'craigslistSearchDetails');
  });

  test('facebook search with no details fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
      },
    };

    doNegativeTest(initialFile, 'facebookSearchDetails');
  });

  test('craigslist search whose details have missing searchTerms fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          // searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'searchTerms');
  });

  test('craigslist search whose details have searchTerms with incorrect type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: 123,
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'searchTerms');
  });

  test('craigslist search whose details has empty searchTerms fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: [],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'with no values');
  });

  test('craigslist search whose details have missing regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          // regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'regions');
  });

  test('craigslist search whose details have regions with incorrect type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: 987,
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'regions');
  });

  test('craigslist search whose details has empty regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: [],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'with no values');
  });

  // aaa
  test('craigslist search whose details have missing regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          // regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'regions');
  });

  test('craigslist search whose details have regions with incorrect type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: 987,
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'regions');
  });

  test('craigslist search whose details has empty regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: [],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'with no values');
  });

  test('craigslist search whose details has invalid regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire', 'poop'],
          subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'invalid value');
  });

  test('craigslist search whose details have missing subcategories fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          // subcategories: ['tools', 'motorcycles'],
        },
      },
    };

    doNegativeTest(initialFile, 'subcategories');
  });

  test('craigslist search whose details have subcategories with incorrect type fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: 987,
        },
      },
    };

    doNegativeTest(initialFile, 'subcategories');
  });

  test('craigslist search whose details has empty subcategories fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: [],
        },
      },
    };

    doNegativeTest(initialFile, 'with no values');
  });

  test('craigslist search whose details has invalid subcategories fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles', 'poop'],
        },
      },
    };

    doNegativeTest(initialFile, 'invalid value');
  });
});

describe('dbSearches test suite', () => {
  beforeEach(() => {
    initializeJest();
  });

  test('fetch enabled searches works', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.enabledSearches));

    const result = dbSearches.init(searchesDb);
    result.mapErr((errorMessages) =>
      errorMessages.forEach((msg) => logger.debug(msg)),
    );
    const searches = dbSearches.getValidEnabledSearches();
    expect(searches).toBeArrayOfSize(2);
    // Correct order:
    expect(searches[0]).toEqual(expect.objectContaining({ sid: '61' }));
    expect(searches[1]).toEqual(expect.objectContaining({ sid: '60' }));
  });

  test('fetch search by sid works', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.valid));

    dbSearches.init(searchesDb);
    const search = dbSearches.getSearchBySid('5');
    // This if is only here to satisfy typescript
    if (!search) {
      expect(search).toBeDefined();
      return;
    }
    expect(search).toContainKeys(['sid', 'alias', 'isEnabled']);
    expect(search.sid).toBe('5');
  });

  test('fetch search by invalid sid fails', () => {
    searchesDb.setCacheDir(JSON.stringify(dbSearchesTestData.valid));

    dbSearches.init(searchesDb);
    const search = dbSearches.getSearchBySid('-9');
    expect(search).toBeUndefined();
  });
});
