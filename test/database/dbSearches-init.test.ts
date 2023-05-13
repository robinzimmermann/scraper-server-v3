import { jest } from '@jest/globals';
import 'jest-extended';

import JsonDb from '../../src/api/jsonDb/lowdbDriver';
import { FacebookRadius, Searches } from '../../src/database/models/dbSearches';

import * as dbSearches from '../../src/database/dbSearches';
import { FacebookRegion, Source } from '../../src/database/models/dbSearches';
// import * as dbSearchesTestData from './testData/dbSearchesTestData';
import { SpiedFunction } from 'jest-mock';

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

  test('initializes when no database file is present', () => {
    searchesDb.setCacheDir('');
    dbSearches.init(searchesDb);

    expect(dbSearches.getSearchBySid('333')).toBeUndefined();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('initializes database when file has no objects', () => {
    searchesDb.setCacheDir('{}');
    dbSearches.init(searchesDb);

    expect(dbSearches.getSearchBySid('333')).toBeUndefined();
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  test('valid search succeeds', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        minPrice: 111,
        maxPrice: 222,
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
      '6': {
        sid: '6',
        alias: 'demolition hammer',
        isEnabled: true,
        rank: 95,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '5 miles' },
          ],
        },
      },
      '7': {
        sid: '7',
        alias: 'polaris',
        isEnabled: true,
        rank: 95,
        sources: ['craigslist', 'facebook'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '5 miles' },
          ],
        },
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));

    const result = dbSearches.init(searchesDb);

    expect(result.isOk()).toBeTrue();

    expect(writeSpy).toHaveBeenCalledTimes(0);

    const search1 = dbSearches.getSearchBySid('5');
    if (!search1) {
      expect(search1).toBeDefined();
      return;
    }
    expect(search1.sid).toBe('5');
    expect(search1.alias).toBe('KTM dirt bikes');
    expect(search1.isEnabled).toBeTrue();
    expect(search1.rank).toBe(85);
    expect(search1.minPrice).toBe(111);
    expect(search1.maxPrice).toBe(222);
    expect(search1.sources).toBeArrayOfSize(1);
    expect(search1.sources).toIncludeSameMembers([Source.craigslist]);
    expect(search1.craigslistSearchDetails).toBeObject();
    expect(search1.craigslistSearchDetails).toContainAllKeys([
      'searchTerms',
      'regions',
      'subcategories',
    ]);
    expect(search1.craigslistSearchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(search1.craigslistSearchDetails?.searchTerms).toContainAllValues(['search1', 'search2']);
    expect(search1.craigslistSearchDetails?.regions).toBeArrayOfSize(2);
    expect(search1.craigslistSearchDetails?.regions).toContainAllValues([
      'sf bayarea',
      'inland empire',
    ]);
    expect(search1.craigslistSearchDetails?.subcategories).toBeArrayOfSize(2);
    expect(search1.craigslistSearchDetails?.subcategories).toContainAllValues([
      'tools',
      'motorcycles',
    ]);
    expect(search1.log).toBeArrayOfSize(2);
    expect(search1.log).toIncludeSameMembers(['created', 'moved']);

    const search2 = dbSearches.getSearchBySid('6');
    if (!search2) {
      expect(search2).toBeDefined();
      return;
    }
    expect(search2.sid).toBe('6');
    expect(search2.alias).toBe('demolition hammer');
    expect(search2.isEnabled).toBeTrue();
    expect(search2.rank).toBe(95);
    expect(search2.sources).toBeArrayOfSize(1);
    expect(search2.sources).toIncludeSameMembers([Source.facebook]);
    expect(search2.facebookSearchDetails).toBeObject();
    expect(search2.facebookSearchDetails).toContainAllKeys(['searchTerms', 'regionalDetails']);
    expect(search2.facebookSearchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(search2.facebookSearchDetails?.searchTerms).toContainAllValues(['search1', 'search2']);
    expect(search2.facebookSearchDetails?.regionalDetails).toBeArrayOfSize(2);
    expect(search2.facebookSearchDetails?.regionalDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ region: FacebookRegion.reno, distance: FacebookRadius.dist20 }),
        expect.objectContaining({
          region: FacebookRegion.telluride,
          distance: FacebookRadius.dist5,
        }),
      ]),
    );

    const search3 = dbSearches.getSearchBySid('7');
    if (!search3) {
      expect(search3).toBeDefined();
      return;
    }
    expect(search3.sid).toBe('7');
    expect(search3.alias).toBe('polaris');
    expect(search3.isEnabled).toBeTrue();
    expect(search3.rank).toBe(95);
    expect(search3.sources).toBeArrayOfSize(2);
    expect(search3.sources).toIncludeSameMembers([Source.craigslist, Source.facebook]);
    expect(search3.craigslistSearchDetails).toBeObject();
    expect(search3.craigslistSearchDetails).toContainAllKeys([
      'searchTerms',
      'regions',
      'subcategories',
    ]);
    expect(search3.craigslistSearchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(search3.craigslistSearchDetails?.searchTerms).toContainAllValues(['search1', 'search2']);
    expect(search3.craigslistSearchDetails?.regions).toBeArrayOfSize(2);
    expect(search3.craigslistSearchDetails?.regions).toContainAllValues([
      'sf bayarea',
      'inland empire',
    ]);
    expect(search3.craigslistSearchDetails?.subcategories).toBeArrayOfSize(2);
    expect(search3.craigslistSearchDetails?.subcategories).toContainAllValues([
      'tools',
      'motorcycles',
    ]);

    expect(search3.facebookSearchDetails).toBeObject();
    expect(search3.facebookSearchDetails).toContainAllKeys(['searchTerms', 'regionalDetails']);
    expect(search3.facebookSearchDetails?.searchTerms).toBeArrayOfSize(2);
    expect(search3.facebookSearchDetails?.searchTerms).toContainAllValues(['search1', 'search2']);
    expect(search3.facebookSearchDetails?.regionalDetails).toBeArrayOfSize(2);
    expect(search3.facebookSearchDetails?.regionalDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ region: FacebookRegion.reno, distance: FacebookRadius.dist20 }),
        expect.objectContaining({
          region: FacebookRegion.telluride,
          distance: FacebookRadius.dist5,
        }),
      ]),
    );
  });

  test('search with sid not matching its key fails', () => {
    const initialFile = {
      '9': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search',
        'with key',
        '9',
        'does not match its sid',
        '5',
      ]);
    }
  });

  test('search with missing sid fails', () => {
    const initialFile = {
      '5': {
        // sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search',
        'missing property',
        'sid',
        'should be',
        'string',
      ]);
    }
  });
  test('search with incorrect type for sid fails', () => {
    const initialFile = {
      '5': {
        sid: -33,
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search',
        'property',
        'sid',
        '-33',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });
  test('search with empty string sid fails', () => {
    const initialFile = {
      '5': {
        sid: '',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['search', 'property', 'sid', 'empty string']);
    }
  });

  test('search with missing alias fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        // alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'missing property',
        'alias',
        'should be',
        'string',
      ]);
    }
  });
  test('search with incorrect type for alias fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: -33,
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'alias',
        '-33',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });
  test('search with empty string alias fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: '',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['search 5', 'property', 'alias', 'empty string']);
    }
  });

  test('search with missing isEnabled fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        // isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'missing property',
        'isEnabled',
        'should be',
        'boolean',
      ]);
    }
  });
  test('search with incorrect type for isEnabled fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: -33,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'isEnabled',
        'incorrect type',
        'should be',
        'boolean',
      ]);
    }
  });

  test('search with missing rank fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        // rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'missing property',
        'rank',
        'should be',
        'number',
      ]);
    }
  });
  test('search with incorrect type for rank fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 'wrong',
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'rank',
        'incorrect type',
        'should be',
        'number',
      ]);
    }
  });

  test('search with optional minPrice succeeds', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        minPrice: 111,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });

  test('search with incorrect type for minPrice fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        minPrice: 'wrong',
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'minPrice',
        'incorrect type',
        'should be',
        'number',
      ]);
    }
  });

  test('search with optional maxPrice succeeds', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        maxPrice: 222,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });

  test('search with incorrect type for maxPrice fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        maxPrice: 'wrong',
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'maxPrice',
        'incorrect type',
        'should be',
        'number',
      ]);
    }
  });

  test('search with both optional minPrice and maxPrice succeeds', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        minPrice: 111,
        maxPrice: 222,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });

  test('search with maxPrice higher than minPrice fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        minPrice: 777,
        maxPrice: 555,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'minPrice',
        'larger',
        'maxPrice',
        '777',
        '555',
      ]);
    }
  });

  test('search with missing sources fails', () => {
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
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'missing property',
        'sources',
        'should be',
        'array',
        'Source',
      ]);
    }
  });
  test('search with incorrect type for sources fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: -33,
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'sources',
        '-33',
        'incorrect type',
        'should be',
        'array',
        'Source',
      ]);
    }
  });
  test('search with empty array sources fails', () => {
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
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'sources',
        'empty',
        'array',
      ]);
    }
  });
  test('search with invalid array elements for sources fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist', -33, true, '', { also: 'wrong' }],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'sources',
        'invalid values',
        'Source',
        'enum',
        '-33',
        'true',
        "''",
        'wrong',
      ]);
    }
  });

  test('search with optional craigslistSearchDetails succeeds', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });
  test('search with missing craigslistSearchDetails fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        // craigslistSearchDetails: {
        //   searchTerms: ['search1', 'search2'],
        //   regions: ['sf bayarea', 'inland empire'],
        //   subcategories: ['tools', 'motorcycles'],
        // },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'missing property',
        'craigslistSearchDetails',
        'should be',
        'object',
        'CraigslistSearchDetails',
      ]);
    }
  });
  test('search with incorrect type for craigslistSearchDetails fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: -33,
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'craigslistSearchDetails',
        '-33',
        'incorrect type',
        'should be',
        'object',
        'CraigslistSearchDetails',
      ]);
    }
  });

  test('search with optional facebookSearchDetails succeeds', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '5 miles' },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });
  test('search with missing facebookSearchDetails fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        // facebookSearchDetails: {
        //   searchTerms: ['search1', 'search2'],
        //   regionalDetails: [
        //     { region: 'reno', distance: '20 miles' },
        //     { region: 'telluride', distance: '5 miles' },
        //   ],
        // },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'missing property',
        'facebookSearchDetails',
        'should be',
        'object',
        'FacebookSearchDetails',
      ]);
    }
  });
  test('search with incorrect type for facebookSearchDetails fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: -33,
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'facebookSearchDetails',
        '-33',
        'incorrect type',
        'should be',
        'object',
        'FacebookSearchDetails',
      ]);
    }
  });

  test('search with additional unneeded craigslistSearchDetails fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '5 miles' },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'sources',
        "doesn't contain",
        'craigslist',
      ]);
    }
  });

  test('search with additional unneeded facebookSearchDetails fails', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '5 miles' },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'sources',
        "doesn't contain",
        'facebook',
      ]);
    }
  });

  test('search with optional log succeeds', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isOk()).toBeTrue();
  });
  test('search with incorrect type for log fails', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        log: -33,
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'log',
        'incorrect type',
        'should be',
        'array',
        'string',
      ]);
    }
  });
  test('search with empty array log fails', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        log: [],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'log',
        'empty',
        'array',
        'should be',
        'string',
      ]);
    }
  });
  test('search with invalid array elements for log fails', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved', -33, true, '', { also: 'wrong' }],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5',
        'property',
        'log',
        'invalid values',
        'array',
        'string',
        '-33',
        'true',
        '',
        'wrong',
      ]);
    }
  });

  test('search with fake property fails', () => {
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
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
        fake: 'wrong',
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple(['search 5', 'property', 'fake', 'not expected']);
    }
  });

  test('searches 5 craigslistSearchDetails with missing searchTerms fails', () => {
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
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'missing property',
        'searchTerms',
        'should be',
        'string',
      ]);
    }
  });
  test('searches 5 craigslistSearchDetails with incorrect type for searchTerms fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: -33,
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'searchTerms',
        '-33',
        'incorrect type',
        'should be',
        'string',
      ]);
    }
  });
  test('searches 5 craigslistSearchDetails with empty array searchTerms fails', () => {
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
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'searchTerms',
        'empty',
        'array',
        'should be',
        'string',
      ]);
    }
  });
  test('searches 5 craigslistSearchDetails with invalid array elements for searchTerms fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', -33, true, '', { also: 'wrong' }],
          regions: ['sf bayarea', 'inland empire'],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'searchTerms',
        'invalid values',
        'array',
        'string',
        '-33',
        'true',
        '',
        'wrong',
      ]);
    }
  });

  test('searches 5 craigslistSearchDetails with missing regions fails', () => {
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
        log: ['created', 'moved'],
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetail',
        'missing property',
        'regions',
        'should be',
        'array',
        'CraigslistRegion',
      ]);
    }
  });
  test('searches 5 craigslistSearchDetails with incorrect type for regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: -33,
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetail',
        'property',
        'regions',
        '-33',
        'incorrect type',
        'should be',
        'array',
        'CraigslistRegion',
      ]);
    }
  });
  test('searches 5 craigslistSearchDetails with empty array regions fails', () => {
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
        log: ['created', 'moved'],
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetail',
        'property',
        'regions',
        'empty',
        'array',
      ]);
    }
  });
  test('searches 5 craigslistSearchDetails with invalid array elements for regions fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['craigslist'],
        craigslistSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regions: ['sf bayarea', -33, true, '', { also: 'wrong' }],
          subcategories: ['tools', 'motorcycles'],
        },
        log: ['created', 'moved'],
      },
    };

    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetail',
        'property',
        'regions',
        'invalid values',
        'CraigslistRegion',
        'enum',
        '-33',
        'true',
        "''",
        'wrong',
      ]);
    }
  });
  test('search 5 craigslistSearchDetails with missing subcategories fails', () => {
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
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'missing property',
        'subcategories',
        'should be',
        'array',
        'CraigslistSubcategory',
      ]);
    }
  });
  test('search 5 craigslistSearchDetails with incorrect type for subcategories fails', () => {
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
          subcategories: -33,
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'subcategories',
        '-33',
        'incorrect type',
        'should be',
        'array',
        'CraigslistSubcategory',
      ]);
    }
  });
  test('search 5 craigslistSearchDetails with empty array subcategories fails', () => {
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
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'subcategories',
        'empty',
        'array',
      ]);
    }
  });
  test('search 5 craigslistSearchDetails with invalid array elements for subcategories fails', () => {
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
          subcategories: ['tools', -33, true, '', { also: 'wrong' }],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'subcategories',
        'invalid values',
        'CraigslistSubcategory',
        'enum',
        '-33',
        'true',
        "''",
        'wrong',
      ]);
    }
  });

  test('search 5 craigslistSearchDetails with fake property fails', () => {
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
          subcategories: ['tools', 'motorcycles'],
          fake: 'wrong',
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 craigslistSearchDetails',
        'property',
        'fake',
        'not expected',
      ]);
    }
  });
  // TODO Add tests that drill down into the facebookSearchDetails object
  test('search 5 facebookSearchDetails.regionalDetails with missing region fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [{ region: 'reno', distance: '20 miles' }, { distance: '5 miles' }],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails.regionalDetails',
        'missing property',
        'region',
        'should be',
        'enum',
      ]);
    }
  });
  test('search 5 facebookSearchDetails.regionalDetails with incorrect type for region fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: -33, distance: '5 miles' },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails.regionalDetails',
        'incorrect type',
        'region',
        '-33',
        'should be',
        'FacebookRegion',
        'enum',
      ]);
    }
  });
  test('search 5 facebookSearchDetails.regionalDetails with empty string region fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: '', distance: '5 miles' },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails.regionalDetails',
        'incorrect type',
        'region',
        "''",
        'should be',
        'FacebookRegion',
        'enum',
      ]);
    }
  });

  test('search 5 facebookSearchDetails.regionalDetails with missing distance fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [{ region: 'reno', distance: '20 miles' }, { region: 'telluride' }],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails.regionalDetails',
        'missing property',
        'region',
        'should be',
        'enum',
      ]);
    }
  });
  test('search 5 facebookSearchDetails.regionalDetails with incorrect type for distance fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: -33 },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails.regionalDetails',
        'incorrect type',
        'distance',
        '-33',
        'should be',
        'FacebookRadius',
        'enum',
      ]);
    }
  });
  test('search 5 facebookSearchDetails.regionalDetails with empty string distance fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '' },
          ],
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails.regionalDetails',
        'incorrect type',
        'distance',
        "''",
        'should be',
        'FacebookRadius',
        'enum',
      ]);
    }
  });

  test('search 5 facebookSearchDetails with fake property fails', () => {
    const initialFile = {
      '5': {
        sid: '5',
        alias: 'KTM dirt bikes',
        isEnabled: true,
        rank: 85,
        sources: ['facebook'],
        facebookSearchDetails: {
          searchTerms: ['search1', 'search2'],
          regionalDetails: [
            { region: 'reno', distance: '20 miles' },
            { region: 'telluride', distance: '5 miles' },
          ],
          fake: 'wrong',
        },
        log: ['created', 'moved'],
      },
    };
    searchesDb.setCacheDir(JSON.stringify(initialFile));
    const result = dbSearches.init(searchesDb);
    expect(result.isErr()).toBeTrue();
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toIncludeMultiple([
        'search 5 facebookSearchDetails',
        'property',
        'fake',
        'not expected',
      ]);
    }
  });
});
